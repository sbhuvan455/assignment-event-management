import { Event } from "../models/event.model.js";
import { Registration } from "../models/registration.model.js";


export const getAdminDashboard = async (req, res, next) => {
    try {
        const [
            totalEvents,
            upcomingEvents,
            totalRegistrations,
            availableSeats,
            cancelledRegistrations,
        ] = await Promise.all([
            Event.countDocuments(),

            Event.countDocuments({
                status: "Upcoming",
            }),

            Registration.countDocuments(),

            Event.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$availableSeats",
                        },
                    },
                },
            ]),

            Registration.countDocuments({
                status: "Cancelled",
            }),
        ]);

        return res.status(200).json({
            success: true,
            dashboard: {
                totalEvents,
                upcomingEvents,
                totalRegistrations,
                availableSeats:
                    availableSeats[0]?.total || 0,
                cancelledRegistrations,
            },
        });
    } catch (error) {
        next(error);
    }
};


export const getUserDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [
            totalRegistrations,
            registeredEvents,
            cancelledRegistrations,
            attendedEvents,
        ] = await Promise.all([
            Registration.countDocuments({
                user: userId,
            }),

            Registration.countDocuments({
                user: userId,
                status: "Registered",
            }),

            Registration.countDocuments({
                user: userId,
                status: "Cancelled",
            }),

            Registration.countDocuments({
                user: userId,
                status: "Attended",
            }),
        ]);

        return res.status(200).json({
            success: true,
            dashboard: {
                totalRegistrations,
                registeredEvents,
                cancelledRegistrations,
                attendedEvents,
            },
        });
    } catch (error) {
        next(error);
    }
};