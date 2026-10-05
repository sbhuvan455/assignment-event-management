import { useEffect, useState } from "react"; 
import Navbar from "../components/Navbar";

function Events() {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        totalSeats: "",
        status: "Upcoming",
    });

    const loadUser = async () => {
        const response = await fetch(
            "http://localhost:5000/api/auth/me",
            {
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to get user information");
        }

        const data = await response.json();
        setUser(data.user);
    };

    const loadEvents = async () => {
        try {
            setError("");

            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (status) {
                params.append("status", status);
            }

            const response = await fetch(
                `http://localhost:5000/api/events?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load events"
                );
            }

            setEvents(data.events);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await loadUser();
                await loadEvents();
            } catch (error) {
                setError(error.message);
            }
        };

        loadData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadEvents();
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            eventName: "",
            description: "",
            eventDate: "",
            eventTime: "",
            location: "",
            totalSeats: "",
            status: "Upcoming",
        });

        setEditingEvent(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            const url = editingEvent
                ? `http://localhost:5000/api/events/${editingEvent._id}`
                : "http://localhost:5000/api/events";

            const response = await fetch(url, {
                method: editingEvent ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    totalSeats: Number(formData.totalSeats),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save event"
                );
            }

            setMessage(
                editingEvent
                    ? "Event updated successfully"
                    : "Event created successfully"
            );

            resetForm();
            loadEvents();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);

        setFormData({
            eventName: event.eventName,
            description: event.description,
            eventDate: event.eventDate.split("T")[0],
            eventTime: event.eventTime,
            location: event.location,
            totalSeats: event.totalSeats,
            status: event.status,
        });

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/events/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete event"
                );
            }

            setMessage("Event deleted successfully");
            loadEvents();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                "http://localhost:5000/api/registrations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        eventId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            setMessage(
                `Registration successful. Registration ID: ${data.registrationId}`
            );

            loadEvents();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        
        <div className="events-page">
            <Navbar />
            <h1>Events</h1>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search event name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <button type="submit">Search</button>
            </form>

            {user?.role === "admin" && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Close Form" : "Add Event"}
                    </button>

                    {showForm && (
                        <form onSubmit={handleSubmit}>
                            <h2>
                                {editingEvent
                                    ? "Edit Event"
                                    : "Create Event"}
                            </h2>

                            <input
                                name="eventName"
                                placeholder="Event Name"
                                value={formData.eventName}
                                onChange={handleFormChange}
                                required
                            />

                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                type="time"
                                name="eventTime"
                                value={formData.eventTime}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                type="number"
                                name="totalSeats"
                                placeholder="Total Seats"
                                min="1"
                                value={formData.totalSeats}
                                onChange={handleFormChange}
                                required
                            />

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                            >
                                <option value="Upcoming">
                                    Upcoming
                                </option>
                                <option value="Ongoing">
                                    Ongoing
                                </option>
                                <option value="Completed">
                                    Completed
                                </option>
                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>

                            <button type="submit">
                                {editingEvent
                                    ? "Update Event"
                                    : "Create Event"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            )}

            <hr />

            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                events.map((event) => (
                    <div key={event._id} className="event">
                        <h2>{event.eventName}</h2>

                        <p>{event.description}</p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(
                                event.eventDate
                            ).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>Time:</strong>{" "}
                            {event.eventTime}
                        </p>

                        <p>
                            <strong>Location:</strong>{" "}
                            {event.location}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {event.status}
                        </p>

                        <p>
                            <strong>Seats:</strong>{" "}
                            {event.availableSeats} /{" "}
                            {event.totalSeats}
                        </p>

                        {user?.role === "admin" ? (
                            <>
                                <button
                                    onClick={() =>
                                        handleEdit(event)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(event._id)
                                    }
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() =>
                                    handleRegister(event._id)
                                }
                                disabled={
                                    event.availableSeats === 0 ||
                                    event.status !== "Upcoming"
                                }
                            >
                                {event.availableSeats === 0
                                    ? "No Seats"
                                    : "Register"}
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Events;