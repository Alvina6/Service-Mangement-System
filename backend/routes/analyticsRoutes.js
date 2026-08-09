const express = require("express");
const router = express.Router();
const { getSummary } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/summary", protect, authorize("admin"), getSummary);

module.exports = router;
