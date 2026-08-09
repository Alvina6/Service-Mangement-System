const asyncHandler = require("express-async-handler");
const Job = require("../models/Job");

// @desc    Dispatcher creates/schedules a job for a technician
// @route   POST /api/jobs
const createJob = asyncHandler(async (req, res) => {
  const { serviceRequest, customer, technician, scheduledDate } = req.body;
  const job = await Job.create({
    serviceRequest,
    customer,
    technician,
    dispatcher: req.user._id,
    scheduledDate,
  });
  res.status(201).json({ success: true, data: job });
});

// @desc    List jobs (scoped by role)
// @route   GET /api/jobs
const getJobs = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "technician") filter.technician = req.user._id;
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.query.date) {
    const start = new Date(req.query.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.scheduledDate = { $gte: start, $lt: end };
  }

  const jobs = await Job.find(filter)
    .populate("customer", "name address city phone")
    .populate("technician", "name phone")
    .populate("serviceRequest", "requestType description")
    .sort("scheduledDate");

  res.json({ success: true, count: jobs.length, data: jobs });
});

// @desc    Technician updates job status / adds report
// @route   PUT /api/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  const { status, serviceNotes, beforePhotos, afterPhotos, customerSignatureUrl } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (status) job.status = status;
  if (serviceNotes !== undefined) job.serviceNotes = serviceNotes;
  if (beforePhotos) job.beforePhotos = beforePhotos;
  if (afterPhotos) job.afterPhotos = afterPhotos;
  if (customerSignatureUrl) job.customerSignatureUrl = customerSignatureUrl;
  if (status === "completed") job.completedAt = new Date();

  await job.save();
  res.json({ success: true, data: job });
});

module.exports = { createJob, getJobs, updateJob };
