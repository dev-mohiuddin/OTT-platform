interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error?: {
    message?: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function callAdminApi<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.success === false) {
    const errorMessage = payload.success === false ? payload.error?.message : undefined;
    throw new Error(errorMessage ?? "Request failed.");
  }

  return payload.data;
}
