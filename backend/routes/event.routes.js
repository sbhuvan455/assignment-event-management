import express from "express";
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", authenticate, adminOnly, createEvent);
router.put("/:id", authenticate, adminOnly, updateEvent);
router.delete("/:id", authenticate, adminOnly, deleteEvent);

export { router as eventRouter };