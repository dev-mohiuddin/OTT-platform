import { DEFAULT_LOCALE, DEFAULT_TIME_ZONE } from "@/lib/i18n/country-locale-map";

type DateLike = Date | string | number;

export interface DateTimeFormatterOptions
	extends Omit<Intl.DateTimeFormatOptions, "timeZone"> {
	locale?: string;
	timeZone?: string;
	fallback?: string;
}

function toDate(value: DateLike): Date | null {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date;
}

export function formatDateTime(
	value: DateLike,
	options: DateTimeFormatterOptions = {},
): string {
	const date = toDate(value);
	if (!date) {
		return options.fallback ?? "-";
	}

	return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
		dateStyle: options.dateStyle ?? "medium",
		timeStyle: options.timeStyle ?? "short",
		timeZone: options.timeZone ?? DEFAULT_TIME_ZONE,
		hour12: options.hour12,
		weekday: options.weekday,
		day: options.day,
		month: options.month,
		year: options.year,
		hour: options.hour,
		minute: options.minute,
		second: options.second,
	}).format(date);
}

export function formatDate(value: DateLike, options: DateTimeFormatterOptions = {}): string {
	return formatDateTime(value, {
		...options,
		dateStyle: options.dateStyle ?? "medium",
		timeStyle: undefined,
	});
}

export function formatTime(value: DateLike, options: DateTimeFormatterOptions = {}): string {
	return formatDateTime(value, {
		...options,
		dateStyle: undefined,
		timeStyle: options.timeStyle ?? "short",
	});
}

export interface RelativeTimeOptions {
	locale?: string;
	style?: Intl.RelativeTimeFormatStyle;
	numeric?: Intl.RelativeTimeFormatNumeric;
	baseDate?: DateLike;
	fallback?: string;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeTime(
	target: DateLike,
	options: RelativeTimeOptions = {},
): string {
	const targetDate = toDate(target);
	const baseDate = toDate(options.baseDate ?? new Date());

	if (!targetDate || !baseDate) {
		return options.fallback ?? "-";
	}

	const delta = targetDate.getTime() - baseDate.getTime();
	const absoluteDelta = Math.abs(delta);

	let value: number;
	let unit: Intl.RelativeTimeFormatUnit;

	if (absoluteDelta < MINUTE) {
		value = Math.round(delta / SECOND);
		unit = "second";
	} else if (absoluteDelta < HOUR) {
		value = Math.round(delta / MINUTE);
		unit = "minute";
	} else if (absoluteDelta < DAY) {
		value = Math.round(delta / HOUR);
		unit = "hour";
	} else if (absoluteDelta < WEEK) {
		value = Math.round(delta / DAY);
		unit = "day";
	} else {
		value = Math.round(delta / WEEK);
		unit = "week";
	}

	return new Intl.RelativeTimeFormat(options.locale ?? DEFAULT_LOCALE, {
		style: options.style ?? "long",
		numeric: options.numeric ?? "auto",
	}).format(value, unit);
}

export function toIsoDate(value: DateLike): string {
	const date = toDate(value);
	if (!date) {
		throw new Error("Invalid date value provided.");
	}

	return date.toISOString();
}
