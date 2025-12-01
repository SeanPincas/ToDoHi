// =====================================================================================================
//                                            LOGIN PAGE (Sticky Note UI)
// =====================================================================================================

import React, { useState } from "react";
import "../pages/LoginPage.css"; // <- ensure path matches your project
import { useAuthContext } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------ SUBMIT HANDLER -------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      await login(email, password);
      // login navigates to dashboard
    } catch (error: any) {
      setError(error?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page-wrap">
      <form className="sticky-card" onSubmit={handleSubmit}>
        <h2 className="sticky-title">Hello, Welcome!</h2>
        <p className="sticky-sub">Login to your ToDoHi</p>

        {error && <div className="sticky-error">{error}</div>}

        <label className="sticky-label">Email</label>
        <input
          className="sticky-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          type="email"
        />

        <label className="sticky-label">Password</label>
        <input
          className="sticky-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
        />

        <button type="submit" className="btn-primary sticky-btn" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <div className="sticky-footer">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
