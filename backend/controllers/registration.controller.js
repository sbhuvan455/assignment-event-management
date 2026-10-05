import mongoose from "mongoose";
import { Registration } from "../models/registration.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";


export const createRegistration = async (req, res, next) => {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            throw new Error("Event ID is required");
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new Error("Invalid event ID");
        }

        const event = await Event.findById(eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        if (event.status === "Cancelled") {
            throw new Error("Cannot register for a cancelled event");
        }

        if (event.status === "Completed") {
            throw new Error("Cannot register for a completed event");
        }

        if (event.availableSeats <= 0) {
            throw new Error("No seats available for this event");
        }

        const existingRegistration = await Registration.findOne({
            user: req.user._id,
            event: eventId,
            status: "Registered",
        });

        if (existingRegistration) {
            throw new Error(
                "You are already registered for this event"
            );
        }

        const registration = await Registration.create({
            registrationId: `REG-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`,
            user: req.user._id,
            event: eventId,
        });

        event.availableSeats -= 1;
        await event.save();

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            registrationId: registration.registrationId,
            registration,
        });
    } catch (error) {
        next(error);
    }
};


export const getRegistrations = async (req, res, next) => {
    try {
        const { search, event, status } = req.query;

        const filter = {};

        if (event) {
            if (!mongoose.Types.ObjectId.isValid(event)) {
                throw new Error("Invalid event ID");
            }

            filter.event = event;
        }

        if (status) {
            filter.status = status;
        }

        let registrations = Registration.find(filter)
            .populate("user", "name email phone")
            .populate(
                "event",
                "eventName eventDate eventTime location"
            )
            .sort({ registrationDate: -1 });

        if (search) {
            const users = await User
                .find({
                    $or: [
                        {
                            name: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            email: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                    ],
                })
                .select("_id");

            const userIds = users.map((user) => user._id);

            filter.user = { $in: userIds };

            registrations = Registration.find(filter)
                .populate("user", "name email phone")
                .populate(
                    "event",
                    "eventName eventDate eventTime location"
                )
                .sort({ registrationDate: -1 });
        }

        const results = await registrations;

        return res.status(200).json({
            success: true,
            count: results.length,
            registrations: results,
        });
    } catch (error) {
        next(error);
    }
};


export const getRegistrationById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid registration ID");
        }

        const registration = await Registration.findById(id)
            .populate("user", "name email phone")
            .populate(
                "event",
                "eventName eventDate eventTime location"
            );

        if (!registration) {
            throw new Error("Registration not found");
        }

        return res.status(200).json({
            success: true,
            registration,
        });
    } catch (error) {
        next(error);
    }
};


export const getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({
            user: req.user._id,
        })
            .populate(
                "event",
                "eventName description eventDate eventTime location status"
            )
            .sort({ registrationDate: -1 });

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });
    } catch (error) {
        next(error);
    }
};


export const updateRegistrationStatus = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid registration ID");
        }

        if (!status) {
            throw new Error("Registration status is required");
        }

        const allowedStatuses = [
            "Registered",
            "Cancelled",
            "Attended",
        ];

        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid registration status");
        }

        const registration = await Registration.findById(id);

        if (!registration) {
            throw new Error("Registration not found");
        }

        const oldStatus = registration.status;


        if (
            oldStatus === "Registered" &&
            status === "Cancelled"
        ) {
            const event = await Event.findById(registration.event);

            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }


        if (
            oldStatus === "Cancelled" &&
            status === "Registered"
        ) {
            const event = await Event.findById(registration.event);

            if (!event) {
                throw new Error("Event not found");
            }

            if (event.availableSeats <= 0) {
                throw new Error(
                    "No seats available for this event"
                );
            }

            event.availableSeats -= 1;
            await event.save();
        }

        registration.status = status;

        await registration.save();

        return res.status(200).json({
            success: true,
            message: "Registration status updated successfully",
            registration,
        });
    } catch (error) {
        next(error);
    }
};


export const cancelRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid registration ID");
        }

        const registration = await Registration.findById(id);

        if (!registration) {
            throw new Error("Registration not found");
        }

        if (
            registration.user.toString() !==
            req.user._id.toString()
        ) {
            throw new Error(
                "You are not authorized to cancel this registration"
            );
        }

        if (registration.status === "Cancelled") {
            throw new Error(
                "Registration is already cancelled"
            );
        }

        if (registration.status === "Attended") {
            throw new Error(
                "An attended registration cannot be cancelled"
            );
        }

        registration.status = "Cancelled";

        await registration.save();

        const event = await Event.findById(registration.event);

        if (event) {
            event.availableSeats += 1;
            await event.save();
        }

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully",
            registration,
        });
    } catch (error) {
        next(error);
    }
};