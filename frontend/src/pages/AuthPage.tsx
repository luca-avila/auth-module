import { AuthForm } from "../features/auth/components/AuthForm";
import "../features/auth/auth.css";

interface AuthPageProps {
  error: string;
  success: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function AuthPage({
  error,
  success,
  onLogin,
  onRegister,
  onForgotPassword,
  onError,
  onSuccess,
}: AuthPageProps) {
  return (
    <div className="container">
      <h1>Auth Demo</h1>
      <AuthForm
        onLogin={onLogin}
        onRegister={onRegister}
        onForgotPassword={onForgotPassword}
        onError={onError}
        onSuccess={onSuccess}
      />
      {success && <p className="success" style={{ marginTop: "1rem" }}>{success}</p>}
      {error && <p className="error" style={{ marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

