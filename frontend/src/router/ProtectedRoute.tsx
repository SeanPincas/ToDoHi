// ---------------------- PROTECTED ROUTE ---------------------------
// 
// Small wrapper that only renders children if user is authenticated.
// If not authenticated → redirect to /login -- NOTE: uses React Router v6 (Navigate) and AuthContext token.
import React,{ useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.tsx";

const ProtectedRoute: React.FC = () => {
    const {token} = useContext(AuthContext);

    // If no token => redirect to login page
    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    // If token exist => render nested routes (outlet)
    return <Outlet />;
};

export default ProtectedRoute;