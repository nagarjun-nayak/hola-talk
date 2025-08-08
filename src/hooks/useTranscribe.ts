

// import { useEffect } from "react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";
// import { api } from "../styles/utils/api";

// type UseTranscribeProps = {
//   roomName: string;
//   audioEnabled: boolean;
//   languageCode?: string;
// };

// const useTranscribe = ({
//   roomName,
//   audioEnabled,
//   languageCode,
// }: UseTranscribeProps) => {
//   const {
//     transcript,
//     resetTranscript,
//     finalTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();

//   const pusherMutation = api.pusher.send.useMutation();

//   // This effect sends the final transcript to other users.
//   useEffect(() => {
//     if (finalTranscript !== "") {
//       pusherMutation.mutate({
//         message: transcript,
//         roomName: roomName,
//         isFinal: true,
//         sourceLang: languageCode,
//       });
//       resetTranscript();
//     }
//   }, [finalTranscript, transcript, roomName, pusherMutation, resetTranscript, languageCode]);

//   // This effect controls the microphone listening.
//   useEffect(() => {
//     if (!browserSupportsSpeechRecognition) {
//       console.error("Browser does not support speech recognition.");
//       return;
//     }

//     if (audioEnabled) {
//       // --- Start of The Fix ---
//       // We use a timeout to delay the start of listening. This helps prevent
//       // a race condition where LiveKit and the Web Speech API fight for
//       // microphone access, which is common for guest users.
//       const timerId = setTimeout(() => {
//         console.log(`Starting speech recognition for language: ${languageCode}`);
//         SpeechRecognition.startListening({
//           continuous: true,
//           language: languageCode,
//         });
//       }, 700); // A 700ms delay is usually enough.

//       // The cleanup function is crucial. It runs if the user turns off their mic
//       // or leaves the call. It prevents the delayed function from running.
//       return () => {
//         clearTimeout(timerId);
//         SpeechRecognition.stopListening();
//         console.log("Stopped speech recognition.");
//       };
//       // --- End of The Fix ---

//     } else {
//       // If audio is not enabled, make sure we are not listening.
//       SpeechRecognition.stopListening();
//     }
//   }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

//   return null;
// };

// export default useTranscribe;




// src/hooks/useTranscribe.ts

import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { api } from "../styles/utils/api";

type UseTranscribeProps = {
  roomName: string;
  audioEnabled: boolean;
  languageCode?: string;
};

const useTranscribe = ({
  roomName,
  audioEnabled,
  languageCode,
}: UseTranscribeProps) => {
  const {
    transcript,
    resetTranscript,
    finalTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const pusherMutation = api.pusher.send.useMutation();

  // This effect sends the final transcript to other users.
  useEffect(() => {
    if (finalTranscript !== "") {
      pusherMutation.mutate({
        message: transcript,
        roomName: roomName,
        isFinal: true,
        // --- START OF THE FIX ---
        // Provide a default language ('en-US') if languageCode is not available.
        sourceLang: languageCode || "en-US",
        // --- END OF THE FIX ---
      });
      resetTranscript();
    }
  }, [finalTranscript, transcript, roomName, pusherMutation, resetTranscript, languageCode]);

  // This effect controls the microphone listening.
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Browser does not support speech recognition.");
      return;
    }

    if (audioEnabled) {
      const timerId = setTimeout(() => {
        console.log(`Starting speech recognition for language: ${languageCode}`);
        SpeechRecognition.startListening({
          continuous: true,
          language: languageCode,
        });
      }, 700);

      return () => {
        clearTimeout(timerId);
        SpeechRecognition.stopListening();
        console.log("Stopped speech recognition.");
      };

    } else {
      SpeechRecognition.stopListening();
    }
  }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

  return null;
};

export default useTranscribe;