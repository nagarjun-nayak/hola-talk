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

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Browser does not support speech recognition.");
      return;
    }

    SpeechRecognition.stopListening();

    if (audioEnabled) {
      // --- Start of The Fix ---
      // We introduce a small delay to prevent a race condition on mobile
      // where LiveKit and Speech Recognition fight for the microphone.
      const startListeningWithDelay = () => {
        SpeechRecognition.startListening({
          continuous: true,
          language: languageCode,
        });
      };
      
      const timer = setTimeout(startListeningWithDelay, 700); // 700ms delay

      // Cleanup function to clear the timer if the component unmounts
      return () => {
        clearTimeout(timer);
        SpeechRecognition.stopListening();
      };
      // --- End of The Fix ---
    }
    
  }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

  return null;
};

export default useTranscribe;