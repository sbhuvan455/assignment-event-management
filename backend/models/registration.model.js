import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: {
        values: ["Registered", "Cancelled", "Attended"],
        message: "Invalid registration status",
      },
      default: "Registered",
    },
  },
  {
    timestamps: true,
  }
);

export const Registration = mongoose.model("Registration", registrationSchema);