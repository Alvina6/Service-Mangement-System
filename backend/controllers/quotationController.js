const asyncHandler = require("express-async-handler");
const Quotation = require("../models/Quotation");
const Notification = require("../models/Notification");

// @desc    Staff creates a quotation for a service request
// @route   POST /api/quotations
const createQuotation = asyncHandler(async (req, res) => {
  const { serviceRequest, customer, lineItems, taxPercent, discountPercent, validUntil, notes } = req.body;

  const quotation = await Quotation.create({
    serviceRequest,
    customer,
    createdBy: req.user._id,
    lineItems,
    taxPercent,
    discountPercent,
    validUntil,
    notes,
    status: "draft",
  });

  res.status(201).json({ success: true, data: quotation });
});

// @desc    List quotations (scoped by role)
// @route   GET /api/quotations
const getQuotations = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const quotations = await Quotation.find(filter)
    .populate("customer", "name email")
    .populate("serviceRequest", "requestType description")
    .sort("-createdAt");

  res.json({ success: true, count: quotations.length, data: quotations });
});

// @desc    Send quotation to customer
// @route   PUT /api/quotations/:id/send
const sendQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    res.status(404);
    throw new Error("Quotation not found");
  }
  quotation.status = "sent";
  await quotation.save();

  await Notification.create({
    user: quotation.customer,
    type: "quotation_approval",
    title: "New quotation ready",
    message: `A quotation for $${quotation.total} is ready for your review.`,
    relatedId: quotation._id,
  });

  res.json({ success: true, data: quotation });
});

// @desc    Customer accepts or rejects a quotation
// @route   PUT /api/quotations/:id/respond
const respondToQuotation = asyncHandler(async (req, res) => {
  const { decision } = req.body; // "accepted" | "rejected"
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    res.status(404);
    throw new Error("Quotation not found");
  }
  if (String(quotation.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to respond to this quotation");
  }
  quotation.status = decision;
  await quotation.save();
  res.json({ success: true, data: quotation });
});

module.exports = { createQuotation, getQuotations, sendQuotation, respondToQuotation };
