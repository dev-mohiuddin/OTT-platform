import { DEFAULT_CURRENCY_CODE, DEFAULT_LOCALE } from "@/lib/i18n/country-locale-map";
import { resolveLocale } from "@/lib/i18n/locale";

type NumericValue = number | string | bigint;

export interface CurrencyFormatterOptions
	extends Omit<Intl.NumberFormatOptions, "style" | "currency"> {
	locale?: string;
	countryCode?: string;
	currency?: string;
	fallback?: string;
}

function toNumber(value: NumericValue): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === "bigint") {
		const asNumber = Number(value);
		return Number.isFinite(asNumber) ? asNumber : null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

export function formatCurrency(
	value: NumericValue,
	options: CurrencyFormatterOptions = {},
): string {
	const numericValue = toNumber(value);
	if (numericValue === null) {
		return options.fallback ?? "-";
	}

	const locale = resolveLocale({
		locale: options.locale,
		countryCode: options.countryCode,
		currency: options.currency,
	});

	const formatter = new Intl.NumberFormat(locale.locale ?? DEFAULT_LOCALE, {
		style: "currency",
		currency: locale.currency ?? options.currency ?? DEFAULT_CURRENCY_CODE,
		minimumFractionDigits: options.minimumFractionDigits,
		maximumFractionDigits: options.maximumFractionDigits,
		currencyDisplay: options.currencyDisplay,
		signDisplay: options.signDisplay,
		notation: options.notation,
		compactDisplay: options.compactDisplay,
		useGrouping: options.useGrouping,
	});

	return formatter.format(numericValue);
}

export interface MinorCurrencyOptions extends CurrencyFormatterOptions {
	minorUnitDivisor?: number;
}

export function formatMinorCurrencyUnits(
	minorUnits: number,
	options: MinorCurrencyOptions = {},
): string {
	const divisor = options.minorUnitDivisor ?? 100;
	const majorUnits = minorUnits / divisor;

	return formatCurrency(majorUnits, options);
}

export function getCurrencySymbol(currency: string, locale: string = DEFAULT_LOCALE): string {
	const formatted = new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		currencyDisplay: "narrowSymbol",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(0);

	return formatted.replace(/[\d\s.,]/g, "").trim() || currency;
}
