export const API_VERSION = "v1";
export const API_BASE_PATH = `/api/${API_VERSION}`;

export function buildVersionedApiPath(pathname: string): string {
	const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return `${API_BASE_PATH}${normalizedPath}`;
}
