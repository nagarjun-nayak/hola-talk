


// import { string, z } from "zod";
// import { pusher } from "../../../styles/utils/pusher";
// import { createTRPCRouter, protectedProcedure } from "../../../server/api/trpc";
// import { translate } from "../../../styles/utils/marianMT";

// // This language map is now the single source of truth for the server
// const languages = {
//     en: "English", kn: "Kannada", hi: "Hindi", fr: "French",
//     de: "German", ja: "Japanese", es: "Spanish", ru: "Russian",
//     ar: "Arabic", zh: "Chinese", pt: "Portuguese", te: "Telugu", ta: "Tamil",
// };

// export const pusherRouter = createTRPCRouter({
//   send: protectedProcedure
//     .input(
//       z.object({
//         message: string(),
//         roomName: string(),
//         isFinal: z.boolean(),
//         sourceLang: z.string(),
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       const { message, roomName, isFinal, sourceLang } = input;
//       const { user } = ctx.session;

//       // --- START OF THE FIX ---
//       // Use a clean, base language code for comparisons and logic
//       const sourceLangCode = sourceLang.split('-')[0];

//       // Create a list of target languages, excluding the original source language
//       const targetLanguages = Object.keys(languages).filter(lang => lang !== sourceLangCode);

//       const translations = await Promise.all(
//         targetLanguages.map(async (lang) => {
//           try {
//             const { text } = await translate(message, { from: sourceLangCode, to: lang });
//             return { [lang]: text };
//           } catch (error) {
//             console.error(`Error translating to ${lang}:`, error);
//             return { [lang]: message }; // Fallback to original message on error
//           }
//         })
//       );

//       const translatedMessages = Object.assign({}, ...translations);
//       // --- END OF THE FIX ---

//       await pusher.trigger(
//         roomName,
//         "transcribe-event",
//         {
//           message,
//           translatedMessages,
//           sender: user.name,
//           isFinal,
//           senderId: user.id,
//           sourceLang: sourceLangCode, // Send the clean code
//         }
//       );

//       await ctx.prisma.transcript.create({
//         data: {
//           text: message,
//           Room: { connect: { name: roomName } },
//           User: { connect: { id: user.id } },
//         },
//       });

//       return { success: true };
//     }),
// });


// src/server/api/routers/pusher.ts

import { string, z } from "zod";
import { pusher } from "../../../styles/utils/pusher";
import { createTRPCRouter, protectedProcedure } from "../../../server/api/trpc";
// This now imports the new Microsoft-powered translate function
import { translate, languages } from "../../../styles/utils/marianMT";

export const pusherRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        message: string(),
        roomName: string(),
        isFinal: z.boolean(),
        sourceLang: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, roomName, isFinal, sourceLang } = input;
      const { user } = ctx.session;

      const sourceLangCode = sourceLang.split('-')[0];
      const targetLanguages = Object.keys(languages).filter(lang => lang !== 'auto' && lang !== sourceLangCode);

      const translations = await Promise.all(
        targetLanguages.map(async (lang) => {
          try {
            const { text } = await translate(message, { from: sourceLangCode, to: lang });
            return { [lang]: text };
          } catch (error) {
            console.error(`Error translating to ${lang}:`, error);
            return { [lang]: message };
          }
        })
      );

      const translatedMessages = Object.assign({}, ...translations);

      await pusher.trigger(
        roomName,
        "transcribe-event",
        {
          message,
          translatedMessages,
          sender: user.name,
          isFinal,
          senderId: user.id,
          sourceLang: sourceLangCode,
        }
      );

      await ctx.prisma.transcript.create({
        data: {
          text: message,
          Room: { connect: { name: roomName } },
          User: { connect: { id: user.id } },
        },
      });

      return { success: true };
    }),
});