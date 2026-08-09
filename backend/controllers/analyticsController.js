const asyncHandler = require("express-async-handler");
const Invoice = require("../models/Invoice");
const Job = require("../models/Job");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const MaintenanceContract = require("../models/MaintenanceContract");

// @desc    Aggregated business metrics for the Admin analytics dashboard
// @route   GET /api/analytics/summary
const getSummary = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    dailyRevenueAgg,
    monthlyRevenueAgg,
    completedJobs,
    pendingJobs,
    activeContracts,
    customerCount,
    requestsByType,
    technicianPerformance,
  ] = await Promise.all([
    Invoice.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    Invoice.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    Job.countDocuments({ status: "completed" }),
    Job.countDocuments({ status: { $in: ["scheduled", "en_route", "in_progress"] } }),
    MaintenanceContract.countDocuments({ status: "active" }),
    User.countDocuments({ role: "customer" }),
    ServiceRequest.aggregate([{ $group: { _id: "$requestType", count: { $sum: 1 } } }]),
    Job.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$technician", completedJobs: { $sum: 1 } } },
      { $sort: { completedJobs: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "technician",
        },
      },
      { $unwind: "$technician" },
      { $project: { "technician.name": 1, completedJobs: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      dailyRevenue: dailyRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      completedJobs,
      pendingJobs,
      activeMaintenanceContracts: activeContracts,
      totalCustomers: customerCount,
      mostRequestedServices: requestsByType,
      technicianPerformance,
    },
  });
});

module.exports = { getSummary };
