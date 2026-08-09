const express = require("express");
const router = express.Router();
const { createInvoice, getInvoices, recordPayment } = require("../controllers/invoiceController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("admin"), createInvoice);
router.get("/", protect, getInvoices);
router.post("/:id/payments", protect, authorize("admin", "customer"), recordPayment);

module.exports = router;
