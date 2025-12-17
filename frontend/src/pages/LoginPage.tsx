// =====================================================================================================
//                                            LOGIN PAGE (Sticky Note UI)
// =====================================================================================================
// Clean refactor using iconLibrary, improved validation,
// and aligned structure with RegisterPage.
// =====================================================================================================

import React, { useState } from "react";
import "../pages/LoginPage.css";
import { useAuthContext } from "../context/AuthContext";
import { Icons } from "../styles/iconLibrary";

const LoginPage: React.FC = () => {
  const { login } = useAuthContext();

  // --------------------------- Controlled Inputs ---------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading + Error states
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================================
  //                               HANDLE SUBMIT
  // =======================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);

    try {
      await login(email.trim(), password.trim());
      // login() internally redirects → no navigate() needed
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  // =======================================================================
  //                                      UI
  // =======================================================================
  return (
    <div className="login-page-wrap">

      {/* ---------------------- Sticky Note Card ---------------------- */}
      <form className="sticky-card" onSubmit={handleSubmit}>
        <h2 className="sticky-title">Hello, Welcome!</h2>
        <p className="sticky-sub">Login to your ToDoHi</p>

        {/* Error Message */}
        {error && <div className="sticky-error">{error}</div>}

        {/* ---------------------- EMAIL FIELD ---------------------- */}
        <label className="sticky-label">Email</label>
        <div className="sticky-input-wrap">
          <Icons.User className="sticky-input-icon" />
          <input
            className="sticky-input"
            value={email}
            type="email"
            placeholder="user@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ---------------------- PASSWORD FIELD ---------------------- */}
        <label className="sticky-label">Password</label>
        <div className="sticky-input-wrap">
          <Icons.Lock className="sticky-input-icon" />
          <input
            className="sticky-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ---------------------- SUBMIT BUTTON ---------------------- */}
        <button type="submit" className="btn-primary sticky-btn" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {/* ---------------------- FOOTER LINK ---------------------- */}
        <div className="sticky-footer">
          Don’t have an account?{" "}
          <a href="/register" className="sticky-footer-link">Register</a>
        </div>
      </form>

    </div>
  );
};

export default LoginPage;
