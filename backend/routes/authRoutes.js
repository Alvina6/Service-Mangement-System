const express = require("express");
const router = express.Router();
const { register, login, getMe, createStaffUser } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/staff", protect, authorize("admin"), createStaffUser);

module.exports = router;
