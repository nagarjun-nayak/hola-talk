
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
// };

// /**
//  * Translates text using the reliable public Google Translate endpoint.
//  * This is the best no-key, no-signup option for quality and reliability.
//  */
// async function translateText(
//   text: string,
//   options: TranslationOptions
// ): Promise<TranslationResult> {
//   if (!text || text.trim() === "") {
//     return {
//       text: "",
//       from: { language: { iso: options.from || "auto" } },
//       raw: {},
//     };
//   }

//   try {
//     const sourceLang = options.from?.split('-')[0] || "auto";
//     const targetLang = options.to.split('-')[0];

//     console.log(`Translating with Google: "${text}" from ${sourceLang} to ${targetLang}`);

//     const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

//     const response = await axios.get(googleUrl, {
//       timeout: 5000, // 5-second timeout
//     });

//     if (response.data && response.data[0] && response.data[0][0]) {
//       const translatedText = response.data[0][0][0];
//       console.log("Google Translate successful.");
//       return {
//         text: translatedText,
//         from: { language: { iso: sourceLang } },
//         raw: { translatedText },
//       };
//     } else {
//       throw new Error("Invalid response format from Google Translate API");
//     }
//   } catch (error) {
//     console.error("Google Translate error:", error);
//     // Fallback to the original text to prevent the app from breaking.
//     return {
//       text: text,
//       from: { language: { iso: options.from || "auto" } },
//       raw: { error: error },
//     };
//   }
// }

// export const translate = translateText;

// export function setCORS() {
//   return translateText;
// }

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


// src/styles/utils/marianMT.ts

import axios from "axios";
import { env } from "../../env.mjs";

type TranslationResult = {
  text: string;
  from: { language: { iso: string; }; };
  raw: any;
};

type TranslationOptions = {
  from?: string;
  to: string;
};

/**
 * Translates text using the Microsoft Translator API.
 * This function is designed to be run on the server.
 */
async function translateText(
  text: string,
  options: TranslationOptions
): Promise<TranslationResult> {
  if (!text || text.trim() === "") {
    return { text: "", from: { language: { iso: options.from || "auto" } }, raw: {} };
  }

  try {
    const response = await axios({
      baseURL: env.MS_TRANSLATOR_ENDPOINT,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': env.MS_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': env.MS_TRANSLATOR_REGION,
        'Content-type': 'application/json',
      },
      params: {
        'api-version': '3.0',
        'from': options.from?.split('-')[0] || 'auto',
        'to': options.to.split('-')[0],
      },
      data: [{ 'text': text }],
    });

    const translatedText = response.data[0].translations[0].text;
    return { text: translatedText, from: { language: { iso: options.from || "auto" } }, raw: response.data };

  } catch (error) {
    console.error("Microsoft Translator error:", error);
    // Fallback to original text if translation fails
    return { text: text, from: { language: { iso: options.from || "auto" } }, raw: { error } };
  }
}

export const translate = translateText;

// This function is kept for compatibility but is not used for client-side calls anymore.
export function setCORS() {
  return translateText;
}

export const languages = {
  auto: "Automatic", en: "English", kn: "Kannada", hi: "Hindi", fr: "French",
  de: "German", ja: "Japanese", es: "Spanish", ru: "Russian", ar: "Arabic",
  zh: "Chinese", pt: "Portuguese", te: "Telugu", ta: "Tamil",
};