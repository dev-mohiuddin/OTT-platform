export type ServerLogLevel = "debug" | "info" | "warn" | "error";

const LOG_PRIORITY: Record<ServerLogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

const DEFAULT_LOG_LEVEL: ServerLogLevel = "info";

export type ServerLogContext = Record<string, unknown>;

interface ServerLogRecord {
	timestamp: string;
	level: ServerLogLevel;
	message: string;
	context?: ServerLogContext;
}

export interface ServerLogger {
	debug(message: string, context?: ServerLogContext): void;
	info(message: string, context?: ServerLogContext): void;
	warn(message: string, context?: ServerLogContext): void;
	error(message: string, context?: ServerLogContext): void;
	child(context: ServerLogContext): ServerLogger;
}

function parseLogLevel(value: string | undefined): ServerLogLevel {
	if (!value) {
		return DEFAULT_LOG_LEVEL;
	}

	const normalized = value.toLowerCase();
	if (normalized === "debug" || normalized === "info" || normalized === "warn" || normalized === "error") {
		return normalized;
	}

	return DEFAULT_LOG_LEVEL;
}

function shouldLog(level: ServerLogLevel, minLevel: ServerLogLevel): boolean {
	return LOG_PRIORITY[level] >= LOG_PRIORITY[minLevel];
}

function sanitizeContext(context: ServerLogContext | undefined): ServerLogContext | undefined {
	if (!context) {
		return undefined;
	}

	const sanitized: ServerLogContext = {};

	for (const [key, value] of Object.entries(context)) {
		if (value instanceof Error) {
			sanitized[key] = {
				name: value.name,
				message: value.message,
				stack: value.stack,
			};
			continue;
		}

		sanitized[key] = value;
	}

	return sanitized;
}

function write(level: ServerLogLevel, message: string, context: ServerLogContext | undefined): void {
	const record: ServerLogRecord = {
		timestamp: new Date().toISOString(),
		level,
		message,
		context: sanitizeContext(context),
	};

	const serialized = JSON.stringify(record);

	if (level === "error") {
		console.error(serialized);
		return;
	}

	if (level === "warn") {
		console.warn(serialized);
		return;
	}

	console.info(serialized);
}

export function createServerLogger(
	baseContext: ServerLogContext = {},
	minLevel: ServerLogLevel = parseLogLevel(process.env.LOG_LEVEL),
): ServerLogger {
	function log(level: ServerLogLevel, message: string, context: ServerLogContext = {}): void {
		if (!shouldLog(level, minLevel)) {
			return;
		}

		write(level, message, {
			...baseContext,
			...context,
		});
	}

	return {
		debug: (message, context) => log("debug", message, context),
		info: (message, context) => log("info", message, context),
		warn: (message, context) => log("warn", message, context),
		error: (message, context) => log("error", message, context),
		child: (context) =>
			createServerLogger(
				{
					...baseContext,
					...context,
				},
				minLevel,
			),
	};
}

export const serverLogger = createServerLogger();
