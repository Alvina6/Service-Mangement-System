const asyncHandler = require("express-async-handler");
const MaintenanceContract = require("../models/MaintenanceContract");
const Notification = require("../models/Notification");

// @desc    Admin creates an annual maintenance plan for a customer
// @route   POST /api/maintenance-contracts
const createContract = asyncHandler(async (req, res) => {
  const { customer, planName, visitsPerYear, price, startDate, endDate, autoRenew } = req.body;
  const contract = await MaintenanceContract.create({
    customer,
    planName,
    visitsPerYear,
    price,
    startDate,
    endDate,
    autoRenew,
    nextVisitDate: startDate,
  });
  res.status(201).json({ success: true, data: contract });
});

// @desc    List contracts (scoped by role)
// @route   GET /api/maintenance-contracts
const getContracts = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const contracts = await MaintenanceContract.find(filter)
    .populate("customer", "name email city")
    .sort("-createdAt");

  res.json({ success: true, count: contracts.length, data: contracts });
});

// @desc    Renew a maintenance contract
// @route   PUT /api/maintenance-contracts/:id/renew
const renewContract = asyncHandler(async (req, res) => {
  const { newEndDate } = req.body;
  const contract = await MaintenanceContract.findById(req.params.id);
  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }
  contract.endDate = newEndDate;
  contract.status = "active";
  contract.visitsCompleted = 0;
  contract.reminderSent = false;
  await contract.save();
  res.json({ success: true, data: contract });
});

// @desc    Scan and send reminders for expiring contracts
// @route   POST /api/maintenance-contracts/check-reminders
const checkContractRenewals = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // 1. Mark expired contracts
  const expiredContracts = await MaintenanceContract.find({
    endDate: { $lt: today },
    status: { $ne: "expired" }
  });
  for (const c of expiredContracts) {
    c.status = "expired";
    await c.save();
  }

  // 2. Mark expiring soon contracts & send reminders
  const expiringSoonContracts = await MaintenanceContract.find({
    endDate: { $gte: today, $lte: thirtyDaysFromNow },
    status: { $nin: ["expiring_soon", "expired"] }
  });
  
  let remindersSentCount = 0;
  for (const c of expiringSoonContracts) {
    c.status = "expiring_soon";
    if (!c.reminderSent) {
      c.reminderSent = true;
      // Send in-app notification
      await Notification.create({
        user: c.customer,
        type: "maintenance_due_reminder",
        title: "Maintenance plan renewal due",
        message: `Your maintenance plan "${c.planName}" is expiring soon (on ${new Date(c.endDate).toLocaleDateString()}). Please renew to keep your comfort on track.`,
        relatedId: c._id,
      });
      remindersSentCount++;
    }
    await c.save();
  }

  res.json({
    success: true,
    data: {
      expiredCount: expiredContracts.length,
      expiringSoonCount: expiringSoonContracts.length,
      remindersSent: remindersSentCount
    }
  });
});

module.exports = { createContract, getContracts, renewContract, checkContractRenewals };
