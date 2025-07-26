//mz
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
        sourceLang: languageCode, // Change 1: Add the source language code
      });
      resetTranscript();
    }
    // Change 2: Add languageCode and other dependencies to ensure the hook updates correctly
  }, [finalTranscript, transcript, roomName, pusherMutation, resetTranscript, languageCode]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
        console.error("Browser does not support speech recognition.");
        return;
    }
    SpeechRecognition.stopListening();//mz
    if (audioEnabled) {
      SpeechRecognition.startListening({
        continuous: true,
        language: languageCode,
      });
    }

    // Cleanup function to stop listening when the component unmounts or audio is disabled
    return () => {
        SpeechRecognition.stopListening();
    };
  }, [audioEnabled, languageCode, browserSupportsSpeechRecognition]);

  return null;
};

export default useTranscribe;