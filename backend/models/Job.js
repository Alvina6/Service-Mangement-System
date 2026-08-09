const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dispatcher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "en_route", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    serviceNotes: { type: String },
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    customerSignatureUrl: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
