export interface CountryLocaleProfile {
  countryCode: string;
  defaultLocale: string;
  supportedLocales: readonly string[];
  defaultCurrency: string;
  timeZone: string;
}

export const DEFAULT_COUNTRY_CODE = "BD";
export const DEFAULT_LOCALE = "bn-BD";
export const DEFAULT_CURRENCY_CODE = "BDT";
export const DEFAULT_TIME_ZONE = "Asia/Dhaka";

export const COUNTRY_LOCALE_MAP: Record<string, CountryLocaleProfile> = {
  BD: {
    countryCode: "BD",
    defaultLocale: "bn-BD",
    supportedLocales: ["bn-BD", "en-BD", "en-US"],
    defaultCurrency: "BDT",
    timeZone: "Asia/Dhaka",
  },
  IN: {
    countryCode: "IN",
    defaultLocale: "hi-IN",
    supportedLocales: ["hi-IN", "en-IN", "bn-IN", "en-US"],
    defaultCurrency: "INR",
    timeZone: "Asia/Kolkata",
  },
  US: {
    countryCode: "US",
    defaultLocale: "en-US",
    supportedLocales: ["en-US", "es-US"],
    defaultCurrency: "USD",
    timeZone: "America/New_York",
  },
  GB: {
    countryCode: "GB",
    defaultLocale: "en-GB",
    supportedLocales: ["en-GB", "cy-GB", "en-US"],
    defaultCurrency: "GBP",
    timeZone: "Europe/London",
  },
  AE: {
    countryCode: "AE",
    defaultLocale: "ar-AE",
    supportedLocales: ["ar-AE", "en-AE", "en-US"],
    defaultCurrency: "AED",
    timeZone: "Asia/Dubai",
  },
  SA: {
    countryCode: "SA",
    defaultLocale: "ar-SA",
    supportedLocales: ["ar-SA", "en-SA", "en-US"],
    defaultCurrency: "SAR",
    timeZone: "Asia/Riyadh",
  },
  MY: {
    countryCode: "MY",
    defaultLocale: "ms-MY",
    supportedLocales: ["ms-MY", "en-MY", "zh-MY", "en-US"],
    defaultCurrency: "MYR",
    timeZone: "Asia/Kuala_Lumpur",
  },
};

export function normalizeCountryCode(countryCode: string | undefined | null): string | undefined {
  if (!countryCode) {
    return undefined;
  }

  const normalized = countryCode.trim().toUpperCase();
  if (normalized.length !== 2) {
    return undefined;
  }

  return normalized;
}

export function getCountryLocaleProfile(countryCode: string | undefined | null): CountryLocaleProfile {
  const normalizedCountryCode = normalizeCountryCode(countryCode) ?? DEFAULT_COUNTRY_CODE;

  return COUNTRY_LOCALE_MAP[normalizedCountryCode] ?? COUNTRY_LOCALE_MAP[DEFAULT_COUNTRY_CODE];
}