const asyncHandler = require("express-async-handler");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-8)}`;

// @desc    Admin generates an invoice
// @route   POST /api/invoices
const createInvoice = asyncHandler(async (req, res) => {
  const { customer, quotation, job, amount, dueDate } = req.body;
  const invoice = await Invoice.create({
    invoiceNumber: generateInvoiceNumber(),
    customer,
    quotation,
    job,
    amount,
    dueDate,
  });

  await Notification.create({
    user: customer,
    type: "invoice_generated",
    title: "New invoice",
    message: `Invoice ${invoice.invoiceNumber} for $${amount} has been generated.`,
    relatedId: invoice._id,
  });

  res.status(201).json({ success: true, data: invoice });
});

// @desc    List invoices (scoped by role)
// @route   GET /api/invoices
const getInvoices = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const invoices = await Invoice.find(filter).populate("customer", "name email").sort("-createdAt");
  res.json({ success: true, count: invoices.length, data: invoices });
});

// @desc    Record a payment against an invoice
// @route   POST /api/invoices/:id/payments
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, reference } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  const payment = await Payment.create({
    invoice: invoice._id,
    customer: invoice.customer,
    amount,
    method,
    reference,
  });

  invoice.amountPaid += amount;
  invoice.status = invoice.amountPaid >= invoice.amount ? "paid" : "partially_paid";
  await invoice.save();

  res.status(201).json({ success: true, data: { invoice, payment } });
});

module.exports = { createInvoice, getInvoices, recordPayment };
