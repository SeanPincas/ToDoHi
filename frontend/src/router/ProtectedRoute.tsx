// ---------------------- PROTECTED ROUTE ---------------------------
// 
// Small wrapper that only renders children if user is authenticated.
// If not authenticated → redirect to /login -- NOTE: uses React Router v6 (Navigate) and AuthContext token.
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {

    const { isAuthenticated, loading } = useAuthContext();

    // ------------------ STILL CHECKING TOKEN / USER ------------------
    // Prevents redirect loops & page flicker
    if (loading) {
        return null; // you can replace with a Loader component later
    }

    // ------------------ NOT LOGGED IN ------------------
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ------------------ AUTHENTICATED ------------------
    return <Outlet />;
};

export default ProtectedRoute;