import { useEffect, useState } from "react";

import { verifyEmailToken } from "../../auth/api/authApi";
import "../../../shared/ui/form.css";
import "../../auth/auth.css";

type AsyncStatus = "idle" | "loading" | "success" | "error";

interface VerifyEmailViewProps {
  token: string;
}

export function VerifyEmailView({ token }: VerifyEmailViewProps) {
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

