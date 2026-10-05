import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loadDashboard = async () => {
        const userResponse = await fetch(
            "http://localhost:5000/api/auth/me",
            {
                credentials: "include",
            }
        );

        if (!userResponse.ok) {
            navigate("/login");
            return;
        }

        const userData = await userResponse.json();

        setUser(userData.user);

        const endpoint =
            userData.user.role === "admin"
                ? "/api/dashboard/admin"
                : "/api/dashboard/user";

        const dashboardResponse = await fetch(
            `http://localhost:5000${endpoint}`,
            {
                credentials: "include",
            }
        );

        const dashboardData = await dashboardResponse.json();

        if (!dashboardResponse.ok) {
            throw new Error(
                dashboardData.message || "Failed to load dashboard"
            );
        }

        setDashboard(dashboardData.dashboard);
    };

    const loadRegistrations = async () => {
        if (!user) {
            return;
        }

        let url = "";

        if (user.role === "admin") {
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (eventFilter) {
                params.append("event", eventFilter);
            }

            if (statusFilter) {
                params.append("status", statusFilter);
            }

            url = `http://localhost:5000/api/registrations?${params.toString()}`;
        } else {
            url = "http://localhost:5000/api/registrations/my";
        }

        const response = await fetch(url, {
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load registrations"
            );
        }

        setRegistrations(data.registrations);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                await loadDashboard();
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    useEffect(() => {
        if (!user) {
            return;
        }

        const loadData = async () => {
            try {
                await loadRegistrations();
            } catch (error) {
                setError(error.message);
            }
        };

        loadData();
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            setError("");
            await loadRegistrations();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancelRegistration = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this registration?"
            )
        ) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/registrations/${id}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to cancel registration"
                );
            }

            setMessage("Registration cancelled successfully");

            await loadDashboard();
            await loadRegistrations();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/registrations/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update status"
                );
            }

            setMessage("Registration status updated successfully");

            await loadDashboard();
            await loadRegistrations();
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error && (!user || !dashboard)) {
        return <p className="error">{error}</p>;
    }

    return (
        <div>
            <Navbar />

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <main>
                <h2>Welcome, {user.name}</h2>

                {user.role === "admin" ? (
                    <>
                        <h3>Admin Dashboard</h3>

                        <p>
                            Total Events: {dashboard.totalEvents}
                        </p>

                        <p>
                            Upcoming Events:{" "}
                            {dashboard.upcomingEvents}
                        </p>

                        <p>
                            Total Registrations:{" "}
                            {dashboard.totalRegistrations}
                        </p>

                        <p>
                            Available Seats:{" "}
                            {dashboard.availableSeats}
                        </p>

                        <p>
                            Cancelled Registrations:{" "}
                            {dashboard.cancelledRegistrations}
                        </p>

                        <hr />

                        <h3>Registration Management</h3>

                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search name or email"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="">
                                    All statuses
                                </option>
                                <option value="Registered">
                                    Registered
                                </option>
                                <option value="Cancelled">
                                    Cancelled
                                </option>
                                <option value="Attended">
                                    Attended
                                </option>
                            </select>

                            <button type="submit">
                                Search
                            </button>
                        </form>

                        {registrations.length === 0 ? (
                            <p>No registrations found.</p>
                        ) : (
                            registrations.map((registration) => (
                                <div
                                    key={registration._id}
                                    className="registration"
                                >
                                    <p>
                                        <strong>
                                            Registration ID:
                                        </strong>{" "}
                                        {registration.registrationId}
                                    </p>

                                    <p>
                                        <strong>Name:</strong>{" "}
                                        {registration.user?.name}
                                    </p>

                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {registration.user?.email}
                                    </p>

                                    <p>
                                        <strong>Event:</strong>{" "}
                                        {registration.event?.eventName}
                                    </p>

                                    <p>
                                        <strong>Registration Date:</strong>{" "}
                                        {new Date(
                                            registration.registrationDate
                                        ).toLocaleDateString()}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {registration.status}
                                    </p>

                                    <label>
                                        Update Status:{" "}
                                        <select
                                            value={registration.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    registration._id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Registered">
                                                Registered
                                            </option>

                                            <option value="Cancelled">
                                                Cancelled
                                            </option>

                                            <option value="Attended">
                                                Attended
                                            </option>
                                        </select>
                                    </label>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <>
                        <h3>My Dashboard</h3>

                        <p>
                            Total Registrations:{" "}
                            {dashboard.totalRegistrations}
                        </p>

                        <p>
                            Registered Events:{" "}
                            {dashboard.registeredEvents}
                        </p>

                        <p>
                            Cancelled Registrations:{" "}
                            {dashboard.cancelledRegistrations}
                        </p>

                        <p>
                            Attended Events:{" "}
                            {dashboard.attendedEvents}
                        </p>

                        <hr />

                        <h3>My Registrations</h3>

                        {registrations.length === 0 ? (
                            <p>You have no registrations.</p>
                        ) : (
                            registrations.map((registration) => (
                                <div
                                    key={registration._id}
                                    className="registration"
                                >
                                    <p>
                                        <strong>
                                            Registration ID:
                                        </strong>{" "}
                                        {registration.registrationId}
                                    </p>

                                    <p>
                                        <strong>Event:</strong>{" "}
                                        {registration.event?.eventName}
                                    </p>

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {registration.event?.eventDate
                                            ? new Date(
                                                  registration.event.eventDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{" "}
                                        {registration.event?.eventTime}
                                    </p>

                                    <p>
                                        <strong>Location:</strong>{" "}
                                        {registration.event?.location}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {registration.status}
                                    </p>

                                    {registration.status ===
                                        "Registered" && (
                                        <button
                                            onClick={() =>
                                                handleCancelRegistration(
                                                    registration._id
                                                )
                                            }
                                        >
                                            Cancel Registration
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;