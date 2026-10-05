import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: [200, "Event name cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    eventTime: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },

    totalSeats: {
      type: Number,
      required: [true, "Total seats are required"],
      min: [1, "Total seats must be at least 1"],
    },

    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [0, "Available seats cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
        message: "Invalid event status",
      },
      default: "Upcoming",
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);