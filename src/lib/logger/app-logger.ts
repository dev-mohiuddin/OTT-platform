export type AppLogLevel = "debug" | "info" | "warn" | "error";

const LOG_PRIORITY: Record<AppLogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

export type AppLogContext = Record<string, unknown>;

export interface AppLogger {
	debug(message: string, context?: AppLogContext): void;
	info(message: string, context?: AppLogContext): void;
	warn(message: string, context?: AppLogContext): void;
	error(message: string, context?: AppLogContext): void;
	child(context: AppLogContext): AppLogger;
}

function parseLogLevel(value: string | undefined): AppLogLevel {
	const normalized = value?.toLowerCase();
	if (normalized === "debug" || normalized === "info" || normalized === "warn" || normalized === "error") {
		return normalized;
	}

	return "info";
}

function shouldLog(level: AppLogLevel, minLevel: AppLogLevel): boolean {
	return LOG_PRIORITY[level] >= LOG_PRIORITY[minLevel];
}

function write(level: AppLogLevel, message: string, context: AppLogContext): void {
	const payload = {
		ts: new Date().toISOString(),
		level,
		message,
		context,
	};

	if (level === "error") {
		console.error(payload);
		return;
	}

	if (level === "warn") {
		console.warn(payload);
		return;
	}

	if (level === "debug") {
		console.debug(payload);
		return;
	}

	console.info(payload);
}

export function createAppLogger(
	baseContext: AppLogContext = {},
	minLevel: AppLogLevel = parseLogLevel(
		process.env.NEXT_PUBLIC_LOG_LEVEL ?? process.env.LOG_LEVEL,
	),
): AppLogger {
	function log(level: AppLogLevel, message: string, context: AppLogContext = {}): void {
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
			createAppLogger(
				{
					...baseContext,
					...context,
				},
				minLevel,
			),
	};
}

export const appLogger = createAppLogger();
