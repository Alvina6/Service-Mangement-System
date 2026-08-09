const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc    Register new user (defaults to 'customer'; staff roles created by admin)
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, address, city } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    address,
    city,
    role: "customer",
  });

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Login
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Admin creates a staff user (technician / dispatcher / admin)
// @route   POST /api/auth/staff
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, skills, department } = req.body;

  if (!["technician", "dispatcher", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Role must be technician, dispatcher, or admin");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, phone, password, role, skills, department });
  res.status(201).json({ success: true, user: user.toSafeObject() });
});

module.exports = { register, login, getMe, createStaffUser };
