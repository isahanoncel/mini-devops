"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_os_1 = __importDefault(require("node:os"));
const prom_client_1 = __importDefault(require("prom-client"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 3000);
const VERSION = process.env.APP_VERSION ?? "1.0.0";
// Prometheus Registry
const register = new prom_client_1.default.Registry();
// Default Node.js metrics
prom_client_1.default.collectDefaultMetrics({
    register,
    prefix: "mini_api_",
});
// HTTP request counter
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: "mini_api_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
});
// HTTP request duration histogram
const httpRequestDuration = new prom_client_1.default.Histogram({
    name: "mini_api_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});
// Metrics middleware
app.use((req, res, next) => {
    // Do not instrument Prometheus scraping itself
    if (req.path === "/metrics") {
        return next();
    }
    const start = process.hrtime.bigint();
    res.on("finish", () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route?.path ?? req.path;
        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode),
        };
        httpRequestsTotal.inc(labels);
        httpRequestDuration.observe(labels, duration);
    });
    next();
});
// API
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "DevOps Monitoring is Working!",
        version: VERSION,
        pod: node_os_1.default.hostname(),
        timestamp: new Date().toISOString(),
    });
});
// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
    });
});
// Version
app.get("/api/version", (_req, res) => {
    res.json({
        version: VERSION,
        pod: node_os_1.default.hostname(),
        node: process.version,
    });
});
// Prometheus metrics
app.get("/metrics", async (_req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    }
    catch {
        res.status(500).end("Metrics unavailable");
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mini DevOps API running on port ${PORT}`);
});
