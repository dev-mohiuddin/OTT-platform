export interface PaginationInput {
	page?: number;
	limit?: number;
	totalItems?: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toSafeInteger(value: number | undefined, fallback: number): number {
	if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
		return fallback;
	}

	return Math.trunc(value);
}

export function createPaginationMeta(input: PaginationInput = {}): PaginationMeta {
	const page = Math.max(1, toSafeInteger(input.page, DEFAULT_PAGE));
	const limit = Math.min(MAX_LIMIT, Math.max(1, toSafeInteger(input.limit, DEFAULT_LIMIT)));
	const totalItems = Math.max(0, toSafeInteger(input.totalItems, 0));
	const totalPages = Math.max(1, Math.ceil(totalItems / limit));

	return {
		page,
		limit,
		totalItems,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};
}
