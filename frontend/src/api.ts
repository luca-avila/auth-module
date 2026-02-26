// Configure this for your API
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
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

export async function register(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(getErrorMessage(await res.json()));
  return res.json();
}

export async function login(email: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  
  const res = await fetch(`${API_URL}/auth/jwt/login`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(getErrorMessage(await res.json()));
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/jwt/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_URL}/users/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}
