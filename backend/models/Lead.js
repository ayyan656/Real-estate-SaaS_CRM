import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    budget: {
      type: Number,
      required: [true, "Please provide a budget"],
    },
    interest: String,
    status: {
      type: String,
      enum: ["New", "Contacted", "Viewing", "Negotiation", "Closed"],
      default: "New",
    },
    notes: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    propertyInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    activities: [
      {
        type: {
          type: String,
          enum: ["creation", "assignment", "status_change", "note", "contact"],
        },
        description: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
