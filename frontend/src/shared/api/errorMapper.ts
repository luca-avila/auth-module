const backendCodeToMessage: Record<string, string> = {
  LOGIN_USER_NOT_VERIFIED:
    "Your account is not verified yet. We sent a verification email if one wasn't sent in the last hour.",
  LOGIN_BAD_CREDENTIALS: "Invalid email or password.",
  INVALID_VERIFY_TOKEN:
    "This verification link is invalid or expired. Please request a new one.",
  INVALID_RESET_PASSWORD_TOKEN:
    "This password reset link is invalid or expired. Please request a new one.",
};

export function mapBackendError(code: string): string | null {
  return backendCodeToMessage[code] ?? null;
}

export function getErrorMessageFromPayload(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "object" && detail !== null && "reason" in detail) {
      const reason = (detail as { reason?: unknown }).reason;
      if (typeof reason === "string") return reason;
    }

    if (typeof detail === "string") {
      return mapBackendError(detail) ?? detail;
    }
  }

  if (typeof payload === "string" && payload) {
    return payload;
  }

  return "Something went wrong";
}

