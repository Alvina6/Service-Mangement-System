const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    type: { type: String, enum: ["labor", "equipment", "other"], default: "other" },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lineItems: [lineItemSchema],
    taxPercent: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    validUntil: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

quotationSchema.pre("save", function (next) {
  const subtotal = this.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const afterDiscount = subtotal - subtotal * (this.discountPercent / 100);
  const total = afterDiscount + afterDiscount * (this.taxPercent / 100);
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.total = Math.round(total * 100) / 100;
  next();
});

module.exports = mongoose.model("Quotation", quotationSchema);
