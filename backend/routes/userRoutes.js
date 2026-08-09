const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  getAvailableTechnicians,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.get("/technicians/available", protect, authorize("dispatcher", "admin"), getAvailableTechnicians);
router.get("/", protect, authorize("admin", "dispatcher"), getUsers);
router.get("/:id", protect, getUser);
router.put("/:id", protect, authorize("admin"), updateUser);

module.exports = router;
