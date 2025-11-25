import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // NOTE: replace with real API call (authApi.login)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // fake token for demo — replace with real response.token
        const fakeToken = "DEMO_TOKEN";
        login(fakeToken);

        // redirect to dashboard
        navigate("/");
    };

    return (
        <div className="login-page">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Log In</button>
            </form>
        </div>
    )
}

export default LoginPage