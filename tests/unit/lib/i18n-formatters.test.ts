import { describe, expect, it } from "vitest";

import { formatCurrency, formatMinorCurrencyUnits } from "@/lib/formatters/currency";
import { formatDateTime, formatRelativeTime } from "@/lib/formatters/date-time";
import { formatCompactNumber, formatNumber, formatPercentage } from "@/lib/formatters/number";
import { resolveLocale, resolveLocaleFromRequest } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/messages";

describe("lib/i18n and formatters", () => {
  it("resolves locale using explicit inputs", () => {
    const locale = resolveLocale({
      locale: "hi-IN",
      countryCode: "IN",
      currency: "INR",
    });

    expect(locale.locale).toBe("hi-IN");
    expect(locale.countryCode).toBe("IN");
    expect(locale.currency).toBe("INR");
  });

  it("resolves locale from request headers", () => {
    const request = new Request("https://example.com", {
      headers: {
        "accept-language": "bn-BD,bn;q=0.9,en-US;q=0.8",
        "x-country-code": "BD",
      },
    });

    const locale = resolveLocaleFromRequest(request);
    expect(locale.countryCode).toBe("BD");
    expect(locale.locale).toBe("bn-BD");
  });

  it("returns translated text with locale fallback", () => {
    expect(translate("watchNow", "bn-BD")).toBe("এখন দেখুন");
    expect(translate("watchNow", "fr-FR")).toBe("এখন দেখুন");
  });

  it("formats currency and numbers consistently", () => {
    expect(formatCurrency(1200, { locale: "en-US", currency: "USD" })).toBe("$1,200.00");
    expect(formatMinorCurrencyUnits(12345, { locale: "en-US", currency: "USD" })).toBe(
      "$123.45",
    );
    expect(formatNumber(12345, { locale: "en-US" })).toBe("12,345");
    expect(formatCompactNumber(1200000, { locale: "en-US" })).toContain("M");
    expect(formatPercentage(0.255, { locale: "en-US" })).toBe("25.5%");
  });

  it("formats date/time helpers", () => {
    const date = new Date("2026-04-09T10:00:00.000Z");
    const formattedDateTime = formatDateTime(date, {
      locale: "en-US",
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    });

    expect(formattedDateTime).toContain("2026");

    const relative = formatRelativeTime("2026-04-10T10:00:00.000Z", {
      locale: "en-US",
      baseDate: "2026-04-09T10:00:00.000Z",
      numeric: "always",
    });
    expect(relative).toContain("day");
  });
});