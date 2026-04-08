import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
  getCountryLocaleProfile,
  normalizeCountryCode,
} from "@/lib/i18n/country-locale-map";

export interface LocaleResolution {
  locale: string;
  countryCode: string;
  currency: string;
  timeZone: string;
  language: string;
}

export interface LocaleResolutionInput {
  locale?: string | null;
  countryCode?: string | null;
  currency?: string | null;
  acceptLanguage?: string | null;
}

export interface LocaleResolutionDefaults {
  locale?: string;
  countryCode?: string;
  currency?: string;
}

interface ParsedLanguageTag {
  tag: string;
  quality: number;
}

function normalizeLocaleTag(locale: string | undefined | null): string | undefined {
  if (!locale) {
    return undefined;
  }

  const normalized = locale.trim();
  if (!normalized) {
    return undefined;
  }

  const [languagePart, regionPart] = normalized.replace("_", "-").split("-");
  if (!languagePart) {
    return undefined;
  }

  const language = languagePart.toLowerCase();
  const region = regionPart?.toUpperCase();

  return region ? `${language}-${region}` : language;
}

function parseAcceptLanguage(acceptLanguage: string | undefined | null): string[] {
  if (!acceptLanguage) {
    return [];
  }

  const parsed: ParsedLanguageTag[] = [];

  for (const section of acceptLanguage.split(",")) {
    const [rawTag, ...params] = section.trim().split(";");
    const tag = normalizeLocaleTag(rawTag);
    if (!tag) {
      continue;
    }

    const qualityParam = params.find((entry) => entry.trim().startsWith("q="));
    const qualityValue = qualityParam?.split("=")[1];
    const quality = qualityValue ? Number(qualityValue) : 1;

    parsed.push({
      tag,
      quality: Number.isFinite(quality) ? quality : 1,
    });
  }

  parsed.sort((left, right) => right.quality - left.quality);
  return parsed.map((entry) => entry.tag);
}

function detectCountryFromLocale(locale: string | undefined): string | undefined {
  if (!locale) {
    return undefined;
  }

  const localeParts = locale.split("-");
  if (localeParts.length < 2) {
    return undefined;
  }

  return normalizeCountryCode(localeParts[1]);
}

function pickLocaleForCountry(countryCode: string, localeCandidates: readonly string[]): string {
  const profile = getCountryLocaleProfile(countryCode);

  for (const candidate of localeCandidates) {
    const normalizedCandidate = normalizeLocaleTag(candidate);
    if (!normalizedCandidate) {
      continue;
    }

    if (profile.supportedLocales.includes(normalizedCandidate)) {
      return normalizedCandidate;
    }

    const candidateLanguage = normalizedCandidate.split("-")[0];
    const sameLanguageLocale = profile.supportedLocales.find(
      (supportedLocale) => supportedLocale.split("-")[0] === candidateLanguage,
    );

    if (sameLanguageLocale) {
      return sameLanguageLocale;
    }
  }

  return profile.defaultLocale;
}

function normalizeCurrency(currency: string | undefined | null): string | undefined {
  if (!currency) {
    return undefined;
  }

  const normalized = currency.trim().toUpperCase();
  if (normalized.length !== 3) {
    return undefined;
  }

  return normalized;
}

export function resolveLocale(
  input: LocaleResolutionInput,
  defaults: LocaleResolutionDefaults = {},
): LocaleResolution {
  const explicitLocale = normalizeLocaleTag(input.locale ?? defaults.locale);
  const explicitCountry = normalizeCountryCode(
    input.countryCode ?? defaults.countryCode ?? detectCountryFromLocale(explicitLocale),
  );
  const selectedCountry = explicitCountry ?? DEFAULT_COUNTRY_CODE;
  const profile = getCountryLocaleProfile(selectedCountry);

  const acceptLanguageCandidates = parseAcceptLanguage(input.acceptLanguage);
  const localeCandidates = [explicitLocale, ...acceptLanguageCandidates].filter(
    (locale): locale is string => Boolean(locale),
  );

  const selectedLocale = pickLocaleForCountry(profile.countryCode, localeCandidates);
  const selectedCurrency =
    normalizeCurrency(input.currency ?? defaults.currency) ?? profile.defaultCurrency ?? DEFAULT_CURRENCY_CODE;

  return {
    locale: selectedLocale || DEFAULT_LOCALE,
    countryCode: profile.countryCode || DEFAULT_COUNTRY_CODE,
    currency: selectedCurrency,
    timeZone: profile.timeZone || DEFAULT_TIME_ZONE,
    language: selectedLocale.split("-")[0] || DEFAULT_LOCALE.split("-")[0],
  };
}

export function resolveLocaleFromRequest(
  request: Request,
  defaults: LocaleResolutionDefaults = {},
): LocaleResolution {
  return resolveLocale(
    {
      locale: request.headers.get("x-locale"),
      countryCode:
        request.headers.get("x-country-code") ??
        request.headers.get("x-country") ??
        request.headers.get("cf-ipcountry") ??
        request.headers.get("x-vercel-ip-country"),
      currency: request.headers.get("x-currency"),
      acceptLanguage: request.headers.get("accept-language"),
    },
    defaults,
  );
}