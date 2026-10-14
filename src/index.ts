import express from "express";
import os from "node:os";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.get("/", (_req, res) => {
  res.json({
    message: "Hello from Kubernetes!",
    version: process.env.APP_VERSION ?? "1.0.0",
    pod: os.hostname(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});