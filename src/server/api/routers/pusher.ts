// import { string, z } from "zod";
// import { pusher } from "~/utils/pusher";

// import {
//   createTRPCRouter,
//   publicProcedure,
//   protectedProcedure,
// } from "~/server/api/trpc";
// import { translate } from "~/utils/marianMT";
// export const pusherRouter = createTRPCRouter({
//   send: protectedProcedure
//     .input(
//       z.object({
//         message: string(),
//         roomName: string(),
//         isFinal: z.boolean(),
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       const { message } = input;
//       const { user } = ctx.session;
//       const response = await pusher.trigger(
//         input.roomName,
//         "transcribe-event",
//         {
//           message,
//           sender: user.name,
//           isFinal: input.isFinal,
//           senderId: user.id,
//         }
//       );
//       const { text } = await translate(message, {
//         to: "en",
//       });
//       await ctx.prisma.transcript.create({
//         data: {
//           text: text,
//           Room: {
//             connect: {
//               name: input.roomName,
//             },
//           },
//           User: {
//             connect: {
//               id: user.id,
//             },
//           },
//         },
//       });
//       return response;
//     }),
// });



// src/server/api/routers/pusher.ts
//mz
// import { string, z } from "zod";
// import { pusher } from "../../../styles/utils/pusher";

// import {
//   createTRPCRouter,
//   publicProcedure,
//   protectedProcedure,
// } from "../../../server/api/trpc";
// import { translate } from "../../../styles/utils/marianMT";
// export const pusherRouter = createTRPCRouter({
//   send: protectedProcedure
//     .input(
//       z.object({
//         message: string(),
//         roomName: string(),
//         isFinal: z.boolean(),
//         sourceLang: z.string().optional(), // Change 1: Add sourceLang to the input validation
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       const { message } = input;
//       const { user } = ctx.session;
//       const response = await pusher.trigger(
//         input.roomName,
//         "transcribe-event",
//         {
//           message,
//           sender: user.name,
//           isFinal: input.isFinal,
//           senderId: user.id,
//           sourceLang: input.sourceLang, // Change 2: Add sourceLang to the broadcast payload
//         }
//       );
      
//       // We are leaving the server-side translation logic commented out or removed
//       // as the client will handle all translations.
//       // const { text } = await translate(message, {
//       //   to: "en",
//       // });

//       await ctx.prisma.transcript.create({
//         data: {
//           text: message, // Storing the original transcribed message
//           Room: {
//             connect: {
//               name: input.roomName,
//             },
//           },
//           User: {
//             connect: {
//               id: user.id,
//             },
//           },
//         },
//       });
//       return response;
//     }),
// });




// src/server/api/routers/pusher.ts

import { string, z } from "zod";
import { pusher } from "../../../styles/utils/pusher";
import { createTRPCRouter, protectedProcedure } from "../../../server/api/trpc";
import { translate } from "../../../styles/utils/marianMT"; // Ensure this is imported

export const pusherRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        message: string(),
        roomName: string(),
        isFinal: z.boolean(),
        sourceLang: z.string(), // We will now require the source language
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, roomName, isFinal, sourceLang } = input;
      const { user } = ctx.session;

      // --- START OF THE OPTIMIZATION ---

      // Create a list of all languages we need to translate to.
      // For now, we'll translate to every language in our list except the original.
      const targetLanguages = Object.keys(languages).filter(lang => lang !== 'auto' && lang !== sourceLang.split('-')[0]);

      // Perform all translations in parallel on the server.
      const translations = await Promise.all(
        targetLanguages.map(async (lang) => {
          const { text } = await translate(message, { from: sourceLang, to: lang });
          return { [lang]: text };
        })
      );

      // Combine the translations into a single object e.g., { kn: "...", hi: "..." }
      const translatedMessages = Object.assign({}, ...translations);

      // --- END OF THE OPTIMIZATION ---

      // Broadcast the original message AND the new translated messages object
      const response = await pusher.trigger(
        roomName,
        "transcribe-event",
        {
          message, // Original message
          translatedMessages, // Object with all translations
          sender: user.name,
          isFinal,
          senderId: user.id,
          sourceLang,
        }
      );

      // Store the original, untranslated text in the database
      await ctx.prisma.transcript.create({
        data: {
          text: message,
          Room: { connect: { name: roomName } },
          User: { connect: { id: user.id } },
        },
      });

      return response;
    }),
});

// We need the languages map here for the server-side logic
export const languages = {
    auto: "Automatic", en: "English", kn: "Kannada", hi: "Hindi", fr: "French",
    de: "German", ja: "Japanese", es: "Spanish", ru: "Russian", ar: "Arabic",
    zh: "Chinese", pt: "Portuguese", te: "Telugu", ta: "Tamil",
};

