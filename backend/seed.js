import bcrypt from "bcrypt";

import connectDB from "./db/db.js";
import { User } from "./models/user.model.js";
import { Event } from "./models/event.model.js";


const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Seeding database...");

        const adminEmail = "admin@example.com";
        const adminPassword = "admin123";

        let admin = await User.findOne({
            email: adminEmail,
        });

        if (!admin) {
            const hashedPassword = await bcrypt.hash(
                adminPassword,
                10
            );

            admin = await User.create({
                name: "Admin User",
                email: adminEmail,
                phone: "9876543210",
                password: hashedPassword,
                role: "admin",
            });

            console.log("Admin created");
        } else {
            console.log("Admin already exists");
        }

        const events = [
            {
                eventName: "Tech Conference 2026",
                description:
                    "A technology conference covering modern web development, cloud computing, AI and software engineering.",
                eventDate: new Date("2026-10-20"),
                eventTime: "10:00",
                location: "India Habitat Centre, New Delhi",
                totalSeats: 200,
                availableSeats: 200,
                status: "Upcoming",
            },
            {
                eventName: "React Workshop",
                description:
                    "Hands-on workshop covering React, hooks, state management and modern frontend development.",
                eventDate: new Date("2026-10-25"),
                eventTime: "11:00",
                location: "IIT Delhi",
                totalSeats: 100,
                availableSeats: 100,
                status: "Upcoming",
            },
            {
                eventName: "AI and Machine Learning Meetup",
                description:
                    "A meetup for developers interested in artificial intelligence and machine learning.",
                eventDate: new Date("2026-11-05"),
                eventTime: "14:00",
                location: "Delhi Technological University",
                totalSeats: 150,
                availableSeats: 150,
                status: "Upcoming",
            },
            {
                eventName: "JavaScript Developer Meetup",
                description:
                    "A community meetup for JavaScript and Node.js developers.",
                eventDate: new Date("2026-11-15"),
                eventTime: "16:00",
                location: "Connaught Place, New Delhi",
                totalSeats: 80,
                availableSeats: 80,
                status: "Upcoming",
            },
            {
                eventName: "Web Development Bootcamp",
                description:
                    "A full-day bootcamp covering frontend and backend web development.",
                eventDate: new Date("2026-09-20"),
                eventTime: "09:00",
                location: "NSUT, New Delhi",
                totalSeats: 120,
                availableSeats: 0,
                status: "Completed",
            },
        ];

        for (const eventData of events) {
            const existingEvent = await Event.findOne({
                eventName: eventData.eventName,
            });

            if (existingEvent) {
                console.log(
                    `Event already exists: ${eventData.eventName}`
                );
                continue;
            }

            await Event.create(eventData);

            console.log(
                `Created event: ${eventData.eventName}`
            );
        }

        console.log("\nDatabase seeding completed.");
        console.log("\nAdmin credentials:");
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);

        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed:");
        console.error(error);

        process.exit(1);
    }
};

seedDatabase();