// API requests go through nginx reverse proxy (same origin)
// No need for an absolute URL — all paths are relative.

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
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

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "detail" in err) {
    const detail = err.detail as any;
    if (typeof detail === "object" && detail.reason) return detail.reason;
    if (typeof detail === "string") return detail;
  }
  return "Something went wrong";
}

async function buildHttpError(res: Response): Promise<Error> {
  const payload = await readResponseBody(res);
  const message =
    getErrorMessage(payload) ||
    `Request failed (${res.status} ${res.statusText})`;
  return new Error(message);
}

export async function register(email: string, password: string): Promise<User> {
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await buildHttpError(res);

  const payload = await readResponseBody(res);
  if (typeof payload === "object" && payload !== null && "email" in payload) {
    return payload as User;
  }

  throw new Error("Register response was not valid JSON");
}

export async function login(email: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  
  const res = await fetch("/auth/jwt/login", {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  if (!res.ok) throw await buildHttpError(res);
}

export async function logout(): Promise<void> {
  const res = await fetch("/auth/jwt/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Logout failed");
}

export async function getMe(): Promise<User> {
  const res = await fetch("/users/me", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Not authenticated");

  const payload = await readResponseBody(res);
  if (typeof payload === "object" && payload !== null && "email" in payload) {
    return payload as User;
  }

  throw new Error("Profile response was not valid JSON");
}
