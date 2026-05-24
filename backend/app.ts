import express from "express";
import { paymentRouter } from "./routes/payment.routes";
import { adminRouter } from "./routes/admin.routes";
import { initializeDatabase } from "./config/database.init";

const app = express();

// JSON Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy DB and Storage Bucket Initializer
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error("Database initialization failed asynchronously:", err);
  }
  next();
});


// API root health checks
app.get("/api", (req, res) => {
  res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK", version: "v2.0.26" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK" });
});

// Mount eSewa payment routes
app.use("/api/payment", paymentRouter);

// Mount admin routes (excluding base GET /api/admin if needed, but we define GET /api/admin directly first)
app.get("/api/admin", (req, res) => {
  res.json({ status: "ok", service: "XO CLUB ADMIN REGISTRY CONTROL PORTAL" });
});
app.use("/api/admin", adminRouter);

// Catch-all 404 handler for unmatched API requests to prevent Vercel Serverless Function hanging
app.use((req, res, next) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Cannot ${req.method} ${req.path}. Secure console found no matching registry endpoint.`
  });
});

// Global exception error middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global system error exception:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unhandled exception occurred in the central mainframe matrix."
  });
});

export { app };

