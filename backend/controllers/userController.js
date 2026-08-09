const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    List users, optionally filtered by role
// @route   GET /api/users?role=technician
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).sort("-createdAt");
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

// @desc    Admin updates a user (activate/deactivate, edit details)
// @route   PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.password; // password changes go through a dedicated flow
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

// @desc    List technicians with availability (for dispatcher assignment UI)
// @route   GET /api/users/technicians/available
const getAvailableTechnicians = asyncHandler(async (req, res) => {
  const technicians = await User.find({ role: "technician", isActive: true }).select(
    "name phone skills isAvailable"
  );
  res.json({ success: true, data: technicians });
});

module.exports = { getUsers, getUser, updateUser, getAvailableTechnicians };
