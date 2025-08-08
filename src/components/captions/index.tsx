


//mz
// import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
// import speakOut from "../../styles/utils/speak";
// import { setCORS, languages } from "../../styles/utils/marianMT";

// // Initialize the translation function
// const translate = setCORS();

// // Change 1: Update the Transcription type to include sourceLang
// type Transcription = {
//   sender: string;
//   message: string;
//   senderId: string;
//   isFinal: boolean;
//   sourceLang?: string; // It's optional for safety
// };

// interface Props {
//   transcriptionQueue: Transcription[];
//   setTranscriptionQueue: Dispatch<SetStateAction<Transcription[]>>;
//   languageCode: string;
// }

// const Captions: React.FC<Props> = ({
//   transcriptionQueue,
//   setTranscriptionQueue,
//   languageCode,
// }) => {
//   const [caption, setCaption] = useState<{ sender: string; message: string }>();
//   const [translationError, setTranslationError] = useState<string | null>(null);
  
//   const targetLangCode = languageCode.split("-")[0] || "en";
//   const languageName =
//     languages[targetLangCode as keyof typeof languages] || targetLangCode;

//   useEffect(() => {
//     async function translateText() {
//       if (transcriptionQueue.length > 0 && transcriptionQueue[0]?.message) {
//         const nextTranscription = transcriptionQueue[0];
//         try {
//           const targetLang = languageCode.split("-")[0] || "en";
//           // Change 2: Get the source language from the queue, default to 'auto' if not present
//           const sourceLang = (nextTranscription.sourceLang || 'auto').split("-")[0];

//           console.log(
//             `Translating to: ${targetLang}, from: ${sourceLang}`
//           );
          
//           // Don't translate if source and target languages are the same
//           if(sourceLang === targetLang) {
//             console.log("Source and target language are the same, skipping translation.");
//             setCaption({
//                 message: nextTranscription.message,
//                 sender: nextTranscription.sender,
//             });
//             speakOut(nextTranscription.message, transcriptionQueue.length <= 1, languageCode);
//             return;
//           }

//           console.log(
//             `Attempting to translate: "${nextTranscription.message}" from ${sourceLang} to ${targetLang}`
//           );

//           // Change 3: Pass the explicit source language to the translate function
//           const res = await translate(nextTranscription.message, {
//             from: sourceLang,
//             to: targetLang,
//           });

//           console.log("Translation result:", res);

//           if (res.text) {
//             const isTranslated = res.text.toLowerCase() !== nextTranscription.message.toLowerCase();
//             console.log(
//               `Translation successful: ${
//                 isTranslated ? "Yes" : "No (same as original)"
//               }`
//             );

//             setCaption({
//               message: res.text,
//               sender: nextTranscription.sender,
//             });

//             // Speak the translated text
//             speakOut(res.text as string, transcriptionQueue.length <= 1, languageCode);
//             setTranslationError(null);
//           } else {
//             throw new Error("Translation returned empty text");
//           }
//         } catch (error) {
//           console.error("Error during translation:", error);
//           setTranslationError("Translation error - using original text");
//           setCaption({
//             message: nextTranscription.message,
//             sender: nextTranscription.sender,
//           });
//         } finally {
//           // Remove the processed message from the queue regardless of outcome
//           setTranscriptionQueue((prev) => prev.slice(1));
//         }
//       }
//     }

//     translateText();

//     // Hide the caption after 5 seconds
//     const timer = setTimeout(() => {
//       setCaption({
//         message: "",
//         sender: "",
//       });
//       setTranslationError(null);
//     }, 5000);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [transcriptionQueue, setTranscriptionQueue, languageCode]);

//   return (
//     <div className="closed-captions-wrapper z-50">
//       <div className="closed-captions-container">
//         <div className="caption-language-indicator mb-1 text-xs text-gray-400">
//           {languageName} captions
//         </div>
//         {caption?.message ? (
//           <>
//             <div className="closed-captions-username">{caption.sender}</div>
//             <span>:&nbsp;</span>
//           </>
//         ) : null}
//         <div className="closed-captions-text">
//           {caption?.message}
//           {translationError && (
//             <div className="caption-error">{translationError}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export  default Captions;



// src/components/captions/index.tsx

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import speakOut from "../../styles/utils/speak";
import { languages } from "../../styles/utils/marianMT";

// Updated Transcription type to match the new server payload
type Transcription = {
  sender: string;
  // 'message' is the original, untranslated text
  message: string;
  // 'translatedMessages' is the new object with all translations
  translatedMessages: Record<string, string>;
  senderId: string;
  isFinal: boolean;
  sourceLang?: string;
};

interface Props {
  transcriptionQueue: Transcription[];
  setTranscriptionQueue: Dispatch<SetStateAction<Transcription[]>>;
  languageCode: string; // The user's chosen language to display
}

const Captions: React.FC<Props> = ({
  transcriptionQueue,
  setTranscriptionQueue,
  languageCode,
}) => {
  const [caption, setCaption] = useState<{ sender: string; message: string }>();

  const targetLangCode = languageCode.split("-")[0] || "en";
  const languageName = languages[targetLangCode as keyof typeof languages] || targetLangCode;

  useEffect(() => {
    if (transcriptionQueue.length > 0) {
      const nextTranscription = transcriptionQueue[0]!;

      // --- START OF THE OPTIMIZATION ---

      // Get the right translation from the object sent by the server.
      // If the user's chosen language is the same as the speaker's, show the original message.
      const sourceLangCode = nextTranscription.sourceLang?.split('-')[0];
      const messageToDisplay =
        targetLangCode === sourceLangCode
          ? nextTranscription.message
          : nextTranscription.translatedMessages[targetLangCode] || nextTranscription.message;

      // --- END OF THE OPTIMIZATION ---

      setCaption({
        message: messageToDisplay,
        sender: nextTranscription.sender,
      });

      // Speak the translated text
      speakOut(messageToDisplay, transcriptionQueue.length <= 1, languageCode);

      // Remove the processed message from the queue
      setTranscriptionQueue((prev) => prev.slice(1));
    }

    // Hide the caption after 3 seconds (reduced from 5)
    const timer = setTimeout(() => {
      setCaption({ message: "", sender: "" });
    }, 3000);

    return () => clearTimeout(timer);

  }, [transcriptionQueue, setTranscriptionQueue, languageCode]);

  return (
    <div className="closed-captions-wrapper z-50">
      <div className="closed-captions-container">
        <div className="caption-language-indicator mb-1 text-xs text-gray-400">
          {languageName} captions
        </div>
        {caption?.message ? (
          <>
            <div className="closed-captions-username">{caption.sender}</div>
            <span>:&nbsp;</span>
          </>
        ) : null}
        <div className="closed-captions-text">{caption?.message}</div>
      </div>
    </div>
  );
};

export default Captions;