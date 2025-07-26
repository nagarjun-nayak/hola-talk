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
import { string, z } from "zod";
import { pusher } from "../../../styles/utils/pusher";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { translate } from "../../../styles/utils/marianMT";
export const pusherRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        message: string(),
        roomName: string(),
        isFinal: z.boolean(),
        sourceLang: z.string().optional(), // Change 1: Add sourceLang to the input validation
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message } = input;
      const { user } = ctx.session;
      const response = await pusher.trigger(
        input.roomName,
        "transcribe-event",
        {
          message,
          sender: user.name,
          isFinal: input.isFinal,
          senderId: user.id,
          sourceLang: input.sourceLang, // Change 2: Add sourceLang to the broadcast payload
        }
      );
      
      // We are leaving the server-side translation logic commented out or removed
      // as the client will handle all translations.
      // const { text } = await translate(message, {
      //   to: "en",
      // });

      await ctx.prisma.transcript.create({
        data: {
          text: message, // Storing the original transcribed message
          Room: {
            connect: {
              name: input.roomName,
            },
          },
          User: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      return response;
    }),
});