require("dotenv").config();
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const path = require("path");
const authRoutes = require("./routes/authRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const maintenanceContractRoutes = require("./routes/maintenanceContractRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

connectDB();

const app = express();

// --- Security Middleware ---

// 1. Helmet - sets secure HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. CORS - restrict to known client origin
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));

// 3. NoSQL Injection Prevention - sanitize req.body, req.params, req.query
//    Strips keys starting with '$' or containing '.' from user-supplied data
app.use(mongoSanitize({ replaceWith: "_" }));

// 4. Auth Rate Limiter — 15 requests per 15 minutes on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});

// 5. General API Rate Limiter — 200 requests per minute (prevents scraping/flooding)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, message: "ServiceFlow API is running" }));

app.use("/api/auth", authLimiter, authRoutes); // Auth routes are rate-limited
app.use("/api", apiLimiter); // General rate limit for all other API routes
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/maintenance-contracts", maintenanceContractRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const startServer = (port = DEFAULT_PORT, attempts = 0) => {
  const server = app.listen(port, () => {
    console.log(`ServiceFlow API listening on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts < 10) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort} instead...`);
      if (server.listening) {
        server.close(() => startServer(nextPort, attempts + 1));
      } else {
        startServer(nextPort, attempts + 1);
      }
    } else {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
