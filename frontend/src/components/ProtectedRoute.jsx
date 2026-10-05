import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    setAuthenticated(true);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;