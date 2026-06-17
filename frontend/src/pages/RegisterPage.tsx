import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useTodo } from "../context/TodoContext";
import { Icons } from "../styles/iconLibrary";
import "../components/common/modals/modalBaseTheme.css";
import "../components/common/modals/taskManagementModalTheme.css";
import "./AuthPages.css";
import "./RegisterPage.css";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { register } = useAuthContext();
    const { openModal } = useTodo();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required.");
            return;
        }

        if (password.trim().length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            await register(username.trim(), email.trim(), password.trim());
            navigate("/login", { replace: true });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-page register-page-wrap">
            <div className="auth-book-shell">
                <div className="auth-cover-content">
                    <div className="auth-brand">
                        <img src="/logo.webp" alt="ToDoHi Logo" className="auth-brand-logo" />
                    </div>
                    <p className="auth-brand-tagline">Your notebook for tasks and planning for steady daily progress.</p>

                    <div className="auth-card register-card modal-card-base task-management-modal paper-sheet-lines">
                        <div className="auth-card-header">
                            <h2 className="auth-title">Create Account</h2>
                            <p className="auth-subtitle">Start your notebook with a fresh page <br /> and a clear routine.</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <label className="auth-label">Username</label>
                            <div className="auth-input-wrap">
                                <Icons.User className="auth-input-icon" />
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <label className="auth-label">Email</label>
                            <div className="auth-input-wrap">
                                <Icons.User className="auth-input-icon" />
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <Icons.Lock className="auth-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="8-16 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? (
                                        <Icons.HidePassword className="auth-password-toggle-icon" />
                                    ) : (
                                        <Icons.ShowPassword className="auth-password-toggle-icon" />
                                    )}
                                </button>
                            </div>

                            <button type="submit" className="btn-primary auth-submit-btn register-btn">
                                <Icons.Add className="register-btn-icon" /> Register
                            </button>

                            <p className="auth-footer register-bottom-text">
                                Already have an account?{" "}
                                <Link to="/login" className="auth-footer-link register-link">Login</Link>
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
        </div>
    );
};

export default RegisterPage;
