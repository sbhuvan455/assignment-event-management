import mongoose from "mongoose";
import { Event } from "../models/event.model.js";


export const getEvents = async (req, res, next) => {
    try {
        const { search, status, date } = req.query;

        const filter = {};

        if (search) {
            filter.eventName = {
                $regex: search,
                $options: "i",
            };
        }

        if (status) {
            filter.status = status;
        }

        if (date) {
            const startDate = new Date(date);

            if (isNaN(startDate.getTime())) {
                throw new Error("Invalid date format");
            }

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            filter.eventDate = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        const events = await Event.find(filter)
            .sort({ eventDate: 1 });

        return res.status(200).json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        next(error);
    }
};


export const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid event ID");
        }

        const event = await Event.findById(id);

        if (!event) {
            throw new Error("Event not found");
        }

        return res.status(200).json({
            success: true,
            event,
        });
    } catch (error) {
        next(error);
    }
};


export const createEvent = async (req, res, next) => {
    try {
        const {
            eventName,
            description,
            eventDate,
            eventTime,
            location,
            totalSeats,
            status,
        } = req.body;

        if (
            !eventName ||
            !description ||
            !eventDate ||
            !eventTime ||
            !location ||
            !totalSeats
        ) {
            throw new Error("All event fields are required");
        }

        if (totalSeats < 1) {
            throw new Error("Total seats must be at least 1");
        }

        const event = await Event.create({
            eventName,
            description,
            eventDate,
            eventTime,
            location,
            totalSeats,
            availableSeats: totalSeats,
            status: status || "Upcoming",
        });

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        next(error);
    }
};


export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid event ID");
        }

        const event = await Event.findById(id);

        if (!event) {
            throw new Error("Event not found");
        }

        const {
            eventName,
            description,
            eventDate,
            eventTime,
            location,
            totalSeats,
            status,
        } = req.body;

        if (eventName !== undefined) {
            event.eventName = eventName;
        }

        if (description !== undefined) {
            event.description = description;
        }

        if (eventDate !== undefined) {
            event.eventDate = eventDate;
        }

        if (eventTime !== undefined) {
            event.eventTime = eventTime;
        }

        if (location !== undefined) {
            event.location = location;
        }

        if (status !== undefined) {
            event.status = status;
        }

        if (totalSeats !== undefined) {
            if (totalSeats < 1) {
                throw new Error("Total seats must be at least 1");
            }

            const seatsDifference =
                totalSeats - event.totalSeats;

            event.totalSeats = totalSeats;

            event.availableSeats =
                event.availableSeats + seatsDifference;

            if (event.availableSeats < 0) {
                throw new Error(
                    "Total seats cannot be less than the number of registered seats"
                );
            }
        }

        await event.save();

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        next(error);
    }
};


export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid event ID");
        }

        const event = await Event.findById(id);

        if (!event) {
            throw new Error("Event not found");
        }

        await Event.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};