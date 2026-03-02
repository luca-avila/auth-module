import type { User } from "../../../entities/user/model/types";
import { getCurrentUser } from "../../session/api/sessionApi";
import { login, logout, register, requestPasswordReset } from "../api/authApi";

interface UseAuthActionsArgs {
  setUser: (value: User | null) => void;
  setError: (value: string) => void;
  setSuccess: (value: string) => void;
}

export function useAuthActions({ setUser, setError, setSuccess }: UseAuthActionsArgs) {
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    const me = await getCurrentUser();
    setUser(me);
    clearMessages();
  };

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    await handleLogin(email, password);
  };

  const handleForgotPassword = async (email: string) => {
    await requestPasswordReset(email);
    setError("");
    setSuccess("If an account exists for this email, a reset link was sent.");
  };

  const handleSendResetForCurrentUser = async (user: User) => {
    await requestPasswordReset(user.email);
    setError("");
    setSuccess("Password reset email sent to your account.");
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSuccess("");
  };

  return {
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleSendResetForCurrentUser,
    handleLogout,
  };
}

