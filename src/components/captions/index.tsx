// import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
// import speakOut from "~/utils/speak";
// import { setCORS, languages } from "~/utils/marianMT";

// // Initialize the translation function with a direct connection (no CORS proxy needed)
// const translate = setCORS();

// type Transcription = {
//   sender: string;
//   message: string;
//   senderId: string;
//   isFinal: boolean;
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
//   // Get language name for display
//   const targetLangCode = languageCode.split("-")[0] || "en";
//   const languageName =
//     languages[targetLangCode as keyof typeof languages] || targetLangCode;

//   useEffect(() => {
//     async function translateText() {
//       console.info("transcriptionQueue", transcriptionQueue);
//       if (transcriptionQueue.length > 0 && transcriptionQueue[0]?.message) {
//         try {
//           // Extract the language code from the full locale code (e.g., "kn-IN" -> "kn")
//           const targetLang = languageCode.split("-")[0] || "en";
//           console.log(
//             `Translating to language: ${targetLang} (from ${languageCode})`
//           );

//           // Log translation attempt
//           console.log(
//             `Attempting to translate: "${transcriptionQueue[0].message}" to ${targetLang}`
//           );

//           // Handle the message translation
//           const res = await translate(transcriptionQueue[0].message, {
//             to: targetLang,
//           });

//           console.log("Translation result:", res);

//           if (res.text) {
//             // Check if translation actually happened (text changed)
//             const isTranslated = res.text !== transcriptionQueue[0].message;
//             console.log(
//               `Translation successful: ${
//                 isTranslated ? "Yes" : "No (same as original)"
//               }`
//             );

//             setCaption({
//               message: res.text,
//               sender: transcriptionQueue[0]?.sender as string,
//             });

//             // Speak the translated text
//             const isEmpty = transcriptionQueue.length <= 1;
//             speakOut(res.text as string, isEmpty, languageCode);

//             // Clear any previous errors
//             setTranslationError(null);
//           } else {
//             console.error("Translation returned empty text");
//             setTranslationError("Translation failed - using original text");
//             setCaption({
//               message: transcriptionQueue[0].message,
//               sender: transcriptionQueue[0]?.sender as string,
//             });
//           }
//         } catch (error) {
//           console.error("Error during translation:", error);
//           setTranslationError("Translation error - using original text");
//           setCaption({
//             message: transcriptionQueue[0].message,
//             sender: transcriptionQueue[0]?.sender as string,
//           });
//         } finally {
//           // Remove the processed message from the queue
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
//   }, [transcriptionQueue]);

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

// export default Captions;


//mz
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import speakOut from "../../styles/utils/speak";
import { setCORS, languages } from "../../styles/utils/marianMT";

// Initialize the translation function
const translate = setCORS();

// Change 1: Update the Transcription type to include sourceLang
type Transcription = {
  sender: string;
  message: string;
  senderId: string;
  isFinal: boolean;
  sourceLang?: string; // It's optional for safety
};

interface Props {
  transcriptionQueue: Transcription[];
  setTranscriptionQueue: Dispatch<SetStateAction<Transcription[]>>;
  languageCode: string;
}

const Captions: React.FC<Props> = ({
  transcriptionQueue,
  setTranscriptionQueue,
  languageCode,
}) => {
  const [caption, setCaption] = useState<{ sender: string; message: string }>();
  const [translationError, setTranslationError] = useState<string | null>(null);
  
  const targetLangCode = languageCode.split("-")[0] || "en";
  const languageName =
    languages[targetLangCode as keyof typeof languages] || targetLangCode;

  useEffect(() => {
    async function translateText() {
      if (transcriptionQueue.length > 0 && transcriptionQueue[0]?.message) {
        const nextTranscription = transcriptionQueue[0];
        try {
          const targetLang = languageCode.split("-")[0] || "en";
          // Change 2: Get the source language from the queue, default to 'auto' if not present
          const sourceLang = (nextTranscription.sourceLang || 'auto').split("-")[0];

          console.log(
            `Translating to: ${targetLang}, from: ${sourceLang}`
          );
          
          // Don't translate if source and target languages are the same
          if(sourceLang === targetLang) {
            console.log("Source and target language are the same, skipping translation.");
            setCaption({
                message: nextTranscription.message,
                sender: nextTranscription.sender,
            });
            speakOut(nextTranscription.message, transcriptionQueue.length <= 1, languageCode);
            return;
          }

          console.log(
            `Attempting to translate: "${nextTranscription.message}" from ${sourceLang} to ${targetLang}`
          );

          // Change 3: Pass the explicit source language to the translate function
          const res = await translate(nextTranscription.message, {
            from: sourceLang,
            to: targetLang,
          });

          console.log("Translation result:", res);

          if (res.text) {
            const isTranslated = res.text.toLowerCase() !== nextTranscription.message.toLowerCase();
            console.log(
              `Translation successful: ${
                isTranslated ? "Yes" : "No (same as original)"
              }`
            );

            setCaption({
              message: res.text,
              sender: nextTranscription.sender,
            });

            // Speak the translated text
            speakOut(res.text as string, transcriptionQueue.length <= 1, languageCode);
            setTranslationError(null);
          } else {
            throw new Error("Translation returned empty text");
          }
        } catch (error) {
          console.error("Error during translation:", error);
          setTranslationError("Translation error - using original text");
          setCaption({
            message: nextTranscription.message,
            sender: nextTranscription.sender,
          });
        } finally {
          // Remove the processed message from the queue regardless of outcome
          setTranscriptionQueue((prev) => prev.slice(1));
        }
      }
    }

    translateText();

    // Hide the caption after 5 seconds
    const timer = setTimeout(() => {
      setCaption({
        message: "",
        sender: "",
      });
      setTranslationError(null);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
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
        <div className="closed-captions-text">
          {caption?.message}
          {translationError && (
            <div className="caption-error">{translationError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export  default Captions;