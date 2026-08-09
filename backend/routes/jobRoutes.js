const express = require("express");
const router = express.Router();
const { createJob, getJobs, updateJob } = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("dispatcher", "admin"), createJob);
router.get("/", protect, getJobs);
router.put("/:id", protect, authorize("technician", "dispatcher", "admin"), updateJob);

module.exports = router;
