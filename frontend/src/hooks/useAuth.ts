// Tiny wrapper hook to access the auth context more ergonomically
import { useAuthContext } from "../context/AuthContext";
export const useAuth = () => useAuthContext();
export default useAuth;