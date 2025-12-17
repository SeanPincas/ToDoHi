// =====================================================================================================
//                                             REGISTER PAGE
// =====================================================================================================
// Clean + Modern + Aligned With LoginPage Refactor
// Uses centralized Icons + improved validation flow
// =====================================================================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// global icon library
import { Icons } from "../styles/iconLibrary";

import "./RegisterPage.css";

// ------------------------------ COMPONENT START ------------------------------
const RegisterPage = () => {

    // --------------------------- CONTROLLED INPUTS ---------------------------
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // For showing backend or validation errors
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { register } = useAuthContext();

    // =======================================================================
    //                               HANDLE SUBMIT
    // =======================================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // --------------------- VALIDATION ---------------------
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

            // After registering → go to Login Page
            navigate("/login", { replace: true });

        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

    // =======================================================================
    //                                      UI
    // =======================================================================
    return (
        <div className="register-page-wrap">

            {/* ---------------------- STICKY NOTE CARD ---------------------- */}
            <div className="register-card paper-border">
                <h2 className="register-title">Create Account</h2>

                {/* Error message box */}
                {error && <div className="register-error">{error}</div>}

                {/* ---------------------- FORM ---------------------- */}
                <form onSubmit={handleSubmit} className="register-form">

                    {/* USERNAME */}
                    <label className="register-label">Username</label>
                    <div className="register-input-wrap">
                        <Icons.User className="register-input-icon" />
                        <input
                            type="text"
                            className="register-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* EMAIL */}
                    <label className="register-label">Email</label>
                    <div className="register-input-wrap">
                        <Icons.User className="register-input-icon" />
                        <input
                            type="email"
                            className="register-input"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* PASSWORD */}
                    <label className="register-label">Password</label>
                    <div className="register-input-wrap">
                        <Icons.Lock className="register-input-icon" />
                        <input
                            type="password"
                            className="register-input"
                            placeholder="8–16 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" className="register-btn">
                        <Icons.Add className="register-btn-icon" /> Register
                    </button>

                    {/* NAVIGATION TEXT */}
                    <p className="register-bottom-text">
                        Already have an account?{" "}
                        <Link to="/login" className="register-link">Login</Link>
                    </p>

                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
