const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["ac_unit", "furnace", "thermostat", "duct", "part", "tool", "other"],
      default: "other",
    },
    brand: { type: String },
    unitPrice: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    installedAtCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    warrantyExpiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
