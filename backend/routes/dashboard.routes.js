import express from "express";
import {
    getAdminDashboard,
    getUserDashboard,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get(
    "/admin",
    authenticate,
    adminOnly,
    getAdminDashboard
);

router.get(
    "/user",
    authenticate,
    getUserDashboard
);

export { router as dashboardRouter };