const express = require("express");
const router = express.Router();
const {
  createContract,
  getContracts,
  renewContract,
  checkContractRenewals,
} = require("../controllers/maintenanceContractController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("admin"), createContract);
router.get("/", protect, getContracts);
router.put("/:id/renew", protect, authorize("customer", "admin"), renewContract);
router.post("/check-reminders", protect, authorize("admin"), checkContractRenewals);

module.exports = router;
