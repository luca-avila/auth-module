import { useState, type SyntheticEvent } from "react";

import "../../../shared/ui/form.css";
import "../auth.css";

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function AuthForm({
  onLogin,
  onRegister,
  onForgotPassword,
  onError,
  onSuccess,
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      onError("Enter your email first to reset your password.");
      return;
    }
    setLoading(true);
    try {
      await onForgotPassword(email);
      onSuccess("If an account exists for this email, a reset link was sent.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not request password reset.";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="tabs">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : mode === "login" ? "Sign In" : "Sign Up"}
        </button>
      </form>
      {mode === "login" && (
        <button
          type="button"
          className="link-button"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          Forgot password?
        </button>
      )}
    </div>
  );
}
