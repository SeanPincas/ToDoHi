import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../components/common/modals/modalBaseTheme.css";
import "../components/common/modals/taskManagementModalTheme.css";
import "./AuthPages.css";
import "./LoginPage.css";
import { useAuthContext } from "../context/AuthContext";
import { useTodo } from "../context/TodoContext";
import { Icons } from "../styles/iconLibrary";

const LoginPage: React.FC = () => {
    const { login } = useAuthContext();
    const { openModal } = useTodo();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Login failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page login-page-wrap">
            <div className="auth-book-shell">
                <div className="auth-cover-content">
                    <div className="auth-brand">
                        <img src="/logo.webp" alt="ToDoHi Logo" className="auth-brand-logo" />
                    </div>
                    <p className="auth-brand-tagline">Your notebook for tasks and planning for steady daily progress.</p>

                    <form className="auth-card login-card modal-card-base task-management-modal paper-sheet-lines" onSubmit={handleSubmit}>
                        <div className="auth-card-header">
                            <h2 className="auth-title">Welcome Back</h2>
                            <p className="auth-subtitle">Open your planner and continue where you left off.</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-form">
                            <label className="auth-label">Email</label>
                            <div className="auth-input-wrap">
                                <Icons.User className="auth-input-icon" />
                                <input
                                    className="auth-input"
                                    value={email}
                                    type="email"
                                    placeholder="user@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <Icons.Lock className="auth-input-icon" />
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn-primary auth-submit-btn" disabled={busy}>
                                {busy ? "Signing in..." : "Sign In"}
                            </button>
                        </div>

                        <p className="auth-footer">
                            Don't have an account?{" "}
                            <Link to="/register" className="auth-footer-link">Register</Link>
                        </p>
                        <div className="auth-legal-links">
                            <button type="button" className="auth-legal-link-btn" onClick={() => openModal("privacyPolicy")}>
                                Privacy Policy
                            </button>
                            <span className="auth-legal-separator">|</span>
                            <button type="button" className="auth-legal-link-btn" onClick={() => openModal("termsConditions")}>
                                Terms &amp; Conditions
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

