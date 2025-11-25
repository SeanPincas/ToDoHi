import React from 'react';
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        navigate("/login")
    };

    return (
        <div className="register-page">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <label>Username</label>
                <input />
                <label>Email</label>
                <input />
                <label>Password</label>
                <input type="password" />
                <button type="submit">Create Account</button>
            </form>
        </div>
    )
}

export default RegisterPage