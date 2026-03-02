import { useState, type FormEvent } from "react";

import { resetPassword } from "../../auth/api/authApi";
import "../../../shared/ui/form.css";
import "../../auth/auth.css";

type AsyncStatus = "idle" | "success" | "error";

interface ResetPasswordViewProps {
  token: string;
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
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

