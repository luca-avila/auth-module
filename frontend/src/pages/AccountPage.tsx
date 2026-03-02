import type { User } from "../entities/user/model/types";
import "../features/auth/auth.css";
import "../features/session/session.css";

interface AccountPageProps {
  user: User;
  error: string;
  success: string;
  onSendReset: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function AccountPage({
  user,
  error,
  success,
  onSendReset,
  onLogout,
}: AccountPageProps) {
  return (
    <div className="container">
      <h1>Welcome</h1>
      <div className="user-card">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}</p>
      </div>
      <button onClick={onSendReset}>Send Password Reset Email</button>
      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={onLogout} className="logout-btn">Logout</button>
    </div>
  );
}

