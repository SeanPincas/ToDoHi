// ------------------------------ AUTH HEADERS UTILITY ----------------------------------------------
// This file simply creates the proper Authorization header for API calls.
// The backend expects: Authorization: Bearer <JWT token>
// We pull the token from localStorage (saved during login)
// ----------------------------------------------------------------------------------------------------

export const authHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
    };
};
