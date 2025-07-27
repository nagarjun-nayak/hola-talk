
//mz
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

//     // --- Start of The Fix ---
//     // This is the crucial line. It ensures that every time the user's
//     // microphone or language setting changes, we start with a clean slate.
//     SpeechRecognition.stopListening();

//     if (audioEnabled) {
//       // If the user's audio is on, start listening.
//       SpeechRecognition.startListening({
//         continuous: true,
//         language: languageCode,
//       });
//     }
//     // --- End of The Fix ---

//     // This is a cleanup function: it will stop listening if the component is removed.
//     return () => {
//       SpeechRecognition.stopListening();
//     };
//   }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

//   return null;
// };

// export default useTranscribe;

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
        sourceLang: languageCode,
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
      // --- Start of The Fix ---
      // We use a timeout to delay the start of listening. This helps prevent
      // a race condition where LiveKit and the Web Speech API fight for
      // microphone access, which is common for guest users.
      const timerId = setTimeout(() => {
        console.log(`Starting speech recognition for language: ${languageCode}`);
        SpeechRecognition.startListening({
          continuous: true,
          language: languageCode,
        });
      }, 700); // A 700ms delay is usually enough.

      // The cleanup function is crucial. It runs if the user turns off their mic
      // or leaves the call. It prevents the delayed function from running.
      return () => {
        clearTimeout(timerId);
        SpeechRecognition.stopListening();
        console.log("Stopped speech recognition.");
      };
      // --- End of The Fix ---

    } else {
      // If audio is not enabled, make sure we are not listening.
      SpeechRecognition.stopListening();
    }
  }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

  return null;
};

export default useTranscribe;