import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { paymentRouter } from "./src/server/routes/payment.routes";
import { adminRouter } from "./src/server/routes/admin.routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API health checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "XO CLUB KATHMANDU FULLSTACK NETWORK" });
  });

  // Mount eSewa payment and admin routes
  app.use("/api/payment", paymentRouter);
  app.use("/api/admin", adminRouter);

  // Vite integration middleware for dev environment & SPA fallback in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serving production bundles
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`XO Club Core server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
