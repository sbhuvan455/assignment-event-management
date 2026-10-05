import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", logoutUser);

export { router as authRouter };