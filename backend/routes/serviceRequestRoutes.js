const express = require("express");
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequest,
  assignTechnician,
  updateStatus,
} = require("../controllers/serviceRequestController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("customer"), createServiceRequest);
router.get("/", protect, getServiceRequests);
router.get("/:id", protect, getServiceRequest);
router.put("/:id/assign", protect, authorize("dispatcher", "admin"), assignTechnician);
router.put("/:id/status", protect, authorize("technician", "dispatcher", "admin"), updateStatus);

module.exports = router;
