// =====================================================================================================
//                                             REGISTER PAGE
// =====================================================================================================
import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import "./RegisterPage.css";

// ------------------------------ COMPONENT START ------------------------------
const RegisterPage = () => {

    // Controlled input fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // For showing backend or Validation errors
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { register } = useAuthContext();

    // =======================================================================
    //                               HANDLE SUBMIT
    // =======================================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // --------- simple validation --------------
        if (!username || !email || !password) {
            setError("All Fields are required.")
            return;
        }

        try {
            await register(username, email, password);

            // After registering → redirect to login
            navigate("/login", { replace: true });
        } catch (error: any) {
            setError(error.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div className="register-page-wrap">

            {/* ---------------------- STICKY NOTE CARD ---------------------- */}
            <div className="register-card paper-border">
                <h2 className="register-title">Create Account</h2>

                {/* Error message box */}
                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">

                    {/* Username */}
                    <label className="register-label">Username</label>
                    <input
                        type="text"
                        className="register-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    {/* Email */}
                    <label className="register-label">Email</label>
                    <input
                        type="email"
                        className="register-input"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password */}
                    <label className="register-label">Password</label>
                    <input
                        type="password"
                        className="register-input"
                        placeholder="8–16 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="register-btn">
                        Register
                    </button>

                    <p className="register-bottom-text">
                        Already have an account? <Link to="/login" className="register-link">Login</Link>
                    </p>
                </form>
            </div>
        </div>

    )
}

export default RegisterPage;