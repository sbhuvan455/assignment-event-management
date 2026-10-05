import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./db/db.js";

import { authRouter } from "./routes/auth.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;



app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);


app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/dashboard", dashboardRouter);


app.use(errorMiddleware);


const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();