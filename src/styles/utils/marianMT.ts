// import axios from "axios";

// type TranslationResult = {
//   text: string;
//   from: {
//     language: {
//       iso: string;
//     };
//   };
//   raw: any;
// };

// type TranslationOptions = {
//   from?: string;
//   to: string;
//   format?: string;
//   model?: string;
// };

// // Free and open translation API endpoint
// const LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";
// // Google Translate API alternative (public API)
// const GOOGLE_TRANSLATE_API =
//   "https://translate.googleapis.com/translate_a/single";

// /**
//  * Translates text using LibreTranslate API
//  * A free and open source alternative to commercial translation APIs
//  */
// export async function translate(
//   text: string,
//   options: TranslationOptions
// ): Promise<TranslationResult> {
//   try {
//     if (!text || text.trim() === "") {
//       return {
//         text: "",
//         from: { language: { iso: options.from || "auto" } },
//         raw: {},
//       };
//     }

//     // Prepare request data for LibreTranslate
//     const requestData = {
//       q: text,
//       source: options.from || "auto",
//       target: options.to,
//       format: "text",
//     };

//     // Make API request
//     const response = await axios.post(LIBRE_TRANSLATE_API, requestData, {
//       headers: { "Content-Type": "application/json" },
//     });

//     // Return in a consistent format
//     return {
//       text: response.data.translatedText || text,
//       from: {
//         language: {
//           iso: options.from || "auto",
//         },
//       },
//       raw: response.data,
//     };
//   } catch (error) {
//     console.error("Translation error:", error);
//     // Fallback with original text to prevent application from breaking
//     return {
//       text: text,
//       from: {
//         language: {
//           iso: options.from || "auto",
//         },
//       },
//       raw: { error: error },
//     };
//   }
// }

// // For browser usage with direct API access (no CORS proxy needed for LibreTranslate)
// export function setCORS(corsProxy: string = "") {
//   return async function translateWithCORS(
//     text: string,
//     options: TranslationOptions
//   ): Promise<TranslationResult> {
//     try {
//       if (!text || text.trim() === "") {
//         return {
//           text: "",
//           from: { language: { iso: options.from || "auto" } },
//           raw: {},
//         };
//       }

//       // Use a backup API if the main one doesn't respond
//       const translateEndpoints = [
//         LIBRE_TRANSLATE_API,
//         "https://translate.argosopentech.com/translate",
//       ];

//       // Prepare request data
//       const requestData = {
//         q: text,
//         source: options.from || "auto",
//         target: options.to,
//         format: "text",
//       };

//       let translatedText = text;
//       let translationSuccess = false;

//       // Try each LibreTranslate endpoint
//       for (const endpoint of translateEndpoints) {
//         try {
//           console.log(`Attempting translation with endpoint: ${endpoint}`);
//           const response = await axios.post(endpoint, requestData, {
//             headers: { "Content-Type": "application/json" },
//             timeout: 5000, // 5 second timeout
//           });

//           if (response.data && response.data.translatedText) {
//             translatedText = response.data.translatedText;
//             translationSuccess = true;
//             console.log("Translation successful");
//             break;
//           }
//         } catch (err) {
//           console.warn(`Translation failed with endpoint ${endpoint}:`, err);
//           // Continue to next endpoint
//         }
//       }

//       // If LibreTranslate fails, try using Google Translate API
//       if (!translationSuccess) {
//         console.log("LibreTranslate failed, trying Google Translate API");
//         try {
//           // For languages like Kannada that aren't supported by LibreTranslate
//           const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
//             options.from || "auto"
//           }&tl=${options.to}&dt=t&q=${encodeURIComponent(text)}`;

//           const response = await axios.get(googleUrl, {
//             timeout: 5000,
//           });

//           if (response.data && response.data[0] && response.data[0][0]) {
//             // Google Translate returns a complex nested array, we need to extract the translation
//             translatedText = response.data[0][0][0];
//             translationSuccess = true;
//             console.log("Google Translate translation successful");
//           }
//         } catch (err) {
//           console.warn("Google Translate API failed:", err);
//         }
//       }

//       // Return in a consistent format
//       return {
//         text: translatedText,
//         from: {
//           language: {
//             iso: options.from || "auto",
//           },
//         },
//         raw: { translatedText },
//       };
//     } catch (error) {
//       console.error("Translation error in setCORS:", error);
//       return {
//         text: text,
//         from: {
//           language: {
//             iso: options.from || "auto",
//           },
//         },
//         raw: { error: error },
//       };
//     }
//   };
// }

// // Export language codes with added language support
// export const languages = {
//   auto: "Automatic",
//   en: "English",
//   kn: "Kannada",
//   hi: "Hindi",
//   fr: "French",
//   de: "German",
//   ja: "Japanese",
//   es: "Spanish",
//   ru: "Russian",
//   ar: "Arabic",
//   zh: "Chinese",
//   pt: "Portuguese",
//   te: "Telugu",
//   ta: "Tamil",
// };


import axios from "axios";

type TranslationResult = {
  text: string;
  from: {
    language: {
      iso: string;
    };
  };
  raw: any;
};

type TranslationOptions = {
  from?: string;
  to: string;
  format?: string;
  model?: string;
};

/**
 * Translates text using the most reliable available public API.
 * This function prioritizes the public Google Translate endpoint for reliability.
 */
async function translateText(
  text: string,
  options: TranslationOptions
): Promise<TranslationResult> {
  // Immediately return if there is no text to translate.
  if (!text || text.trim() === "") {
    return {
      text: "",
      from: { language: { iso: options.from || "auto" } },
      raw: {},
    };
  }

  try {
    console.log(`Using Google Translate API for: "${text}"`);
    
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
      options.from || "auto"
    }&tl=${options.to}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await axios.get(googleUrl, {
      timeout: 5000, // 5-second timeout
    });

    // The Google Translate API returns a nested array.
    if (response.data && response.data[0] && response.data[0][0]) {
      const translatedText = response.data[0][0][0];
      console.log("Google Translate successful.");
      return {
        text: translatedText,
        from: { language: { iso: options.from || "auto" } },
        raw: { translatedText },
      };
    } else {
      throw new Error("Invalid response format from Google Translate API");
    }
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback to the original text to prevent the application from breaking.
    return {
      text: text,
      from: { language: { iso: options.from || "auto" } },
      raw: { error: error },
    };
  }
}

// Export the main translate function.
export const translate = translateText;

// The setCORS function will now also just use the main translate function.
export function setCORS() {
  return translateText;
}

// Language map remains the same.
export const languages = {
  auto: "Automatic",
  en: "English",
  kn: "Kannada",
  hi: "Hindi",
  fr: "French",
  de: "German",
  ja: "Japanese",
  es: "Spanish",
  ru: "Russian",
  ar: "Arabic",
  zh: "Chinese",
  pt: "Portuguese",
  te: "Telugu",
  ta: "Tamil",
};