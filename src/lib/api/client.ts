import { ApiResponse } from "@/types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.message ?? payload.error ?? "Request failed",
      response.status,
      payload.error,
    );
  }

  if (typeof payload.data === "undefined") {
    throw new ApiClientError("Response data is missing", response.status);
  }

  return payload.data;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  return parseApiResponse<T>(response);
}
