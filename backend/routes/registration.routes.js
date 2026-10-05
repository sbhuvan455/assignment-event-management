import express from "express";
import {
    createRegistration,
    getRegistrations,
    getRegistrationById,
    getMyRegistrations,
    updateRegistrationStatus,
    cancelRegistration,
} from "../controllers/registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/", authenticate, createRegistration);

router.get("/my", authenticate, getMyRegistrations);

router.get("/", authenticate, adminOnly, getRegistrations);

router.get("/:id", authenticate, getRegistrationById);

router.patch(
    "/:id/status",
    authenticate,
    adminOnly,
    updateRegistrationStatus
);

router.patch(
    "/:id/cancel",
    authenticate,
    cancelRegistration
);

export { router as registrationRouter };