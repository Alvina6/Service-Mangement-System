const asyncHandler = require("express-async-handler");
const ServiceRequest = require("../models/ServiceRequest");
const Notification = require("../models/Notification");

// @desc    Customer creates a service request
// @route   POST /api/service-requests
const createServiceRequest = asyncHandler(async (req, res) => {
  const { requestType, description, images, preferredDate, address, city, isEmergency } = req.body;

  const request = await ServiceRequest.create({
    customer: req.user._id,
    requestType,
    description,
    images,
    preferredDate,
    address,
    city,
    isEmergency: !!isEmergency,
  });

  await Notification.create({
    user: req.user._id,
    type: "service_request_confirmation",
    title: "Service request received",
    message: `Your ${requestType} request has been received. We'll be in touch shortly.`,
    relatedId: request._id,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    List service requests (scoped by role)
// @route   GET /api/service-requests
const getServiceRequests = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.user.role === "technician") filter.assignedTechnician = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const requests = await ServiceRequest.find(filter)
    .populate("customer", "name email phone address city")
    .populate("assignedTechnician", "name phone")
    .sort("-createdAt");

  res.json({ success: true, count: requests.length, data: requests });
});

// @desc    Get single service request
// @route   GET /api/service-requests/:id
const getServiceRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate("customer", "name email phone address city")
    .populate("assignedTechnician", "name phone")
    .populate("assignedDispatcher", "name");

  if (!request) {
    res.status(404);
    throw new Error("Service request not found");
  }
  res.json({ success: true, data: request });
});

// @desc    Dispatcher assigns technician / updates status
// @route   PUT /api/service-requests/:id/assign
const assignTechnician = asyncHandler(async (req, res) => {
  const { technicianId, scheduledDate } = req.body;
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Service request not found");
  }

  request.assignedTechnician = technicianId;
  request.assignedDispatcher = req.user._id;
  request.scheduledDate = scheduledDate;
  request.status = "assigned";
  await request.save();

  await Notification.create({
    user: technicianId,
    type: "technician_assignment",
    title: "New job assigned",
    message: `You've been assigned a ${request.requestType} job.`,
    relatedId: request._id,
  });

  res.json({ success: true, data: request });
});

// @desc    Update request status (technician workflow)
// @route   PUT /api/service-requests/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Service request not found");
  }
  request.status = status;
  await request.save();
  res.json({ success: true, data: request });
});

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequest,
  assignTechnician,
  updateStatus,
};
