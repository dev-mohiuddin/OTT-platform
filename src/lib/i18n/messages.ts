import { DEFAULT_LOCALE } from "@/lib/i18n/country-locale-map";

type BaseDictionary = {
  watchNow: string;
  continueWatching: string;
  subscriptionRequired: string;
  paymentFailed: string;
  somethingWentWrong: string;
};

const DICTIONARY: Record<string, BaseDictionary> = {
  "en-US": {
    watchNow: "Watch now",
    continueWatching: "Continue watching",
    subscriptionRequired: "Subscription required",
    paymentFailed: "Payment failed. Please try again.",
    somethingWentWrong: "Something went wrong.",
  },
  "bn-BD": {
    watchNow: "এখন দেখুন",
    continueWatching: "দেখা চালিয়ে যান",
    subscriptionRequired: "সাবস্ক্রিপশন প্রয়োজন",
    paymentFailed: "পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    somethingWentWrong: "কিছু সমস্যা হয়েছে।",
  },
  "hi-IN": {
    watchNow: "अभी देखें",
    continueWatching: "देखना जारी रखें",
    subscriptionRequired: "सब्सक्रिप्शन आवश्यक है",
    paymentFailed: "पेमेंट विफल हो गया। कृपया दोबारा प्रयास करें।",
    somethingWentWrong: "कुछ गलत हो गया।",
  },
};

export type TranslationKey = keyof BaseDictionary;

function pickDictionary(locale: string | undefined): BaseDictionary {
  if (!locale) {
    return DICTIONARY[DEFAULT_LOCALE as keyof typeof DICTIONARY] ?? DICTIONARY["en-US"];
  }

  const normalized = locale.replace("_", "-");
  const exactMatch = DICTIONARY[normalized as keyof typeof DICTIONARY];
  if (exactMatch) {
    return exactMatch;
  }

  const language = normalized.split("-")[0];
  const languageMatchKey = (Object.keys(DICTIONARY) as Array<keyof typeof DICTIONARY>).find(
    (key) => key.startsWith(`${language}-`),
  );

  if (languageMatchKey) {
    return DICTIONARY[languageMatchKey];
  }

  return DICTIONARY[DEFAULT_LOCALE as keyof typeof DICTIONARY] ?? DICTIONARY["en-US"];
}

export function translate(
  key: TranslationKey,
  locale?: string,
  replacements: Record<string, string | number> = {},
): string {
  const template = pickDictionary(locale)[key] ?? DICTIONARY["en-US"][key];

  return template.replace(/\{(\w+)\}/g, (_fullMatch, replacementKey: string) => {
    const replacementValue = replacements[replacementKey];
    return replacementValue === undefined ? `{${replacementKey}}` : String(replacementValue);
  });
}

export const I18N_MESSAGES = DICTIONARY;