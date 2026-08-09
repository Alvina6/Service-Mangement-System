const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestType: {
      type: String,
      enum: ["installation", "repair", "inspection", "maintenance", "emergency"],
      required: true,
    },
    description: { type: String, required: true },
    images: [{ type: String }],
    preferredDate: { type: Date },
    address: { type: String, required: true },
    city: { type: String, required: true },
    isEmergency: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedDispatcher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
