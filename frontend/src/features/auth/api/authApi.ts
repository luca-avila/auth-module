import type { User } from "../../../entities/user/model/types";
import { request } from "../../../shared/api/httpClient";

export async function register(email: string, password: string): Promise<User> {
  return request<User>("POST", "/auth/register", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  await request<void>("POST", "/auth/jwt/login", {
    body: form,
  });
}

export async function logout(): Promise<void> {
  await request<void>("POST", "/auth/jwt/logout");
}

export async function requestPasswordReset(email: string): Promise<void> {
  await request<void>("POST", "/auth/forgot-password", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailToken(token: string): Promise<User> {
  return request<User>("POST", "/auth/verify", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await request<void>("POST", "/auth/reset-password", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
}

