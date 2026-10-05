import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header>
            <h1>Event Management System</h1>

            <nav>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/events">Events</Link>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </nav>
        </header>
    );
}

export default Navbar;