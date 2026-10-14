import express from "express";
import os from "node:os";

const app = express();

const PORT = Number(process.env.PORT ?? 3000);
const VERSION = process.env.APP_VERSION ?? "1.0.1";

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CI/CD IS WORKING!",
    version: VERSION,
    pod: os.hostname(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
  });
});

app.get("/api/version", (_req, res) => {
  res.json({
    version: VERSION,
    pod: os.hostname(),
    node: process.version,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mini DevOps API running on port ${PORT}`);
});