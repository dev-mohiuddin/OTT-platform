export interface CommonErrorDetails {
	field?: string;
	reason?: string;
	[key: string]: unknown;
}

export interface CommonError {
	code: string;
	message: string;
	status: number;
	details?: CommonErrorDetails;
}
