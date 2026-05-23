import express from "express";
import { paymentRouter } from "../src/server/routes/payment.routes";
import { adminRouter } from "../src/server/routes/admin.routes";

const app = express();

// JSON Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK (VERCEL SERVERLESS)" });
});

// Mount eSewa payment and admin routes
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);

export default app;
