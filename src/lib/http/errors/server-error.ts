export interface ServerHttpErrorOptions<TDetails = unknown> {
	code: string;
	statusCode: number;
	details?: TDetails;
	cause?: unknown;
}

export class ServerHttpError<TDetails = unknown> extends Error {
	readonly code: string;
	readonly statusCode: number;
	readonly details?: TDetails;
	readonly cause?: unknown;

	constructor(message: string, options: ServerHttpErrorOptions<TDetails>) {
		super(message);
		this.name = "ServerHttpError";
		this.code = options.code;
		this.statusCode = options.statusCode;
		this.details = options.details;
		this.cause = options.cause;
	}
}
