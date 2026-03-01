import { useEffect, useState, type FormEvent } from "react";
import AuthForm from "./AuthForm";
import {
  getMe,
  login,
  logout,
  register,
  resetPassword,
  verifyEmailToken,
} from "./api";
import type { User } from "./api";
import "./App.css";

type AsyncStatus = "idle" | "loading" | "success" | "error";

function VerifyEmailView({ token }: { token: string }) {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }

      setStatus("loading");
      try {
        await verifyEmailToken(token);
        if (cancelled) return;
        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Email verification failed.";
        setStatus("error");
        setMessage(msg);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="container">
      <h1>Verify Email</h1>
      <div className="user-card">
        {status === "loading" && <p>Verifying your email...</p>}
        {status === "success" && <p className="success">{message}</p>}
        {status === "error" && <p className="error">{message}</p>}
      </div>
      <a className="action-link" href="/">Back to login</a>
    </div>
  );
}

function ResetPasswordView({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("Missing reset token.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      await resetPassword(token, password);
      setStatus("success");
      setMessage("Password reset successful. You can now log in.");
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed.";
      setStatus("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Reset Password"}
        </button>
      </form>
      {status === "success" && <p className="success" style={{ marginTop: "1rem" }}>{message}</p>}
      {status === "error" && <p className="error" style={{ marginTop: "1rem" }}>{message}</p>}
      <a className="action-link" href="/">Back to login</a>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const pathname = window.location.pathname;
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    await handleLogin(email, password);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    const me = await getMe();
    setUser(me);
    setError("");
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (pathname === "/verify-email") {
    return <VerifyEmailView token={token} />;
  }

  if (pathname === "/reset-password") {
    return <ResetPasswordView token={token} />;
  }

  if (user) {
    return (
      <div className="container">
        <h1>Welcome</h1>
        <div className="user-card">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}</p>
        </div>
        {error && <p className="error">{error}</p>}
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Auth Demo</h1>
      <AuthForm onLogin={handleLogin} onRegister={handleRegister} onError={setError} />
      {error && <p className="error" style={{ marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default App;
