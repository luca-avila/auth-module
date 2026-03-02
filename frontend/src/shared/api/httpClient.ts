import { getErrorMessageFromPayload } from "./errorMapper";

interface RequestOptions {
  headers?: Record<string, string>;
  body?: BodyInit | null;
  credentials?: RequestCredentials;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: options.headers,
    body: options.body ?? null,
    credentials: options.credentials ?? "same-origin",
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessageFromPayload(payload);
    throw new Error(message || `Request failed (${response.status} ${response.statusText})`);
  }

  return payload as T;
}

