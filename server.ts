import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { app } from "./backend/app";

async function startServer() {
  const PORT = 3000;

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
    app.use(expressStaticFallback(distPath));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`XO Club Core server listening at http://0.0.0.0:${PORT}`);
  });
}

// Simple helper to register static fallback paths cleanly
function expressStaticFallback(distPath: string) {
  const expressAppRouter = express.Router();
  expressAppRouter.use(express.static(distPath));
  expressAppRouter.get("*", (req: any, res: any) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  return expressAppRouter;
}

startServer();
