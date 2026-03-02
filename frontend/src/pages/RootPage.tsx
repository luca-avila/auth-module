import { useState } from "react";

import type { User } from "../entities/user/model/types";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { useSessionBootstrap } from "../features/session/hooks/useSessionBootstrap";
import { AccountPage } from "./AccountPage";
import { AuthPage } from "./AuthPage";

export function RootPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, setUser, checkingSession } = useSessionBootstrap();

  const {
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleSendResetForCurrentUser,
    handleLogout,
  } = useAuthActions({
    setUser: (value: User | null) => setUser(value),
    setError,
    setSuccess,
  });

  const handleSendReset = async () => {
    if (!user) return;
    try {
      await handleSendResetForCurrentUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not request password reset.";
      setSuccess("");
      setError(message);
    }
  };

  if (checkingSession) {
    return (
      <div className="container">
        <h1>Auth Demo</h1>
        <p>Checking session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <AccountPage
        user={user}
        error={error}
        success={success}
        onSendReset={handleSendReset}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AuthPage
      error={error}
      success={success}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onForgotPassword={handleForgotPassword}
      onError={(message) => {
        setSuccess("");
        setError(message);
      }}
      onSuccess={(message) => {
        setError("");
        setSuccess(message);
      }}
    />
  );
}

