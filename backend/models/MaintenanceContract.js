const mongoose = require("mongoose");

const maintenanceContractSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planName: { type: String, required: true }, // e.g. Basic, Standard, Premium
    visitsPerYear: { type: Number, required: true },
    visitsCompleted: { type: Number, default: 0 },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    nextVisitDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "expiring_soon", "expired", "cancelled"],
      default: "active",
    },
    autoRenew: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceContract", maintenanceContractSchema);
