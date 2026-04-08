import { DEFAULT_LOCALE } from "@/lib/i18n/country-locale-map";

type NumericValue = number | string | bigint;

export interface NumberFormatterOptions extends Intl.NumberFormatOptions {
	locale?: string;
	fallback?: string;
}

function toFiniteNumber(value: NumericValue): number | null {
	const parsed = typeof value === "bigint" ? Number(value) : Number(value);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return parsed;
}

export function formatNumber(value: NumericValue, options: NumberFormatterOptions = {}): string {
	const numericValue = toFiniteNumber(value);
	if (numericValue === null) {
		return options.fallback ?? "-";
	}

	return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
		maximumFractionDigits: options.maximumFractionDigits,
		minimumFractionDigits: options.minimumFractionDigits,
		useGrouping: options.useGrouping,
		signDisplay: options.signDisplay,
		notation: options.notation,
		compactDisplay: options.compactDisplay,
		style: options.style,
		unit: options.unit,
		unitDisplay: options.unitDisplay,
		currency: options.currency,
		currencyDisplay: options.currencyDisplay,
	}).format(numericValue);
}

export function formatCompactNumber(
	value: NumericValue,
	options: Omit<NumberFormatterOptions, "notation"> = {},
): string {
	return formatNumber(value, {
		...options,
		notation: "compact",
		compactDisplay: options.compactDisplay ?? "short",
		maximumFractionDigits: options.maximumFractionDigits ?? 1,
	});
}

export function formatPercentage(
	value: NumericValue,
	options: Omit<NumberFormatterOptions, "style"> = {},
): string {
	return formatNumber(value, {
		...options,
		style: "percent",
		maximumFractionDigits: options.maximumFractionDigits ?? 2,
	});
}
