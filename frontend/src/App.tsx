import { useState } from "react";
import AuthForm from "./AuthForm";
import { login, logout, getMe, register, User } from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

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
