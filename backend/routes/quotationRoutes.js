const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getQuotations,
  sendQuotation,
  respondToQuotation,
} = require("../controllers/quotationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("dispatcher", "admin"), createQuotation);
router.get("/", protect, getQuotations);
router.put("/:id/send", protect, authorize("dispatcher", "admin"), sendQuotation);
router.put("/:id/respond", protect, authorize("customer"), respondToQuotation);

module.exports = router;
