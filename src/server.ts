// backend/src/server.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// Security middleware
import {
  securityHeaders,
  corsOptions,
  rateLimiter,
  sanitizeInput,
  errorHandler,
} from "./middleware/security";

// Routes
import vehicleRoutes from "./routes/vehicle.routes";
import categoryRoutes from "./routes/category.routes";
import inquiryRoutes from "./routes/inquiry.routes";
import testDriveRoutes from "./routes/testDrive.routes";
import financingRoutes from "./routes/financing.routes";
import tradeInRoutes from "./routes/tradeIn.routes";
import promotionRoutes from "./routes/promotion.routes";

// ⭐ Upload route
import uploadRoutes from "./routes/upload.routes";

// ⭐ NEW → Branch routes
import branchRoutes from "./routes/branch.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------
// HTTP SERVER → Required for Socket.io
// ----------------------------------------
const server = http.createServer(app);

// ----------------------------------------
// SOCKET.IO SETUP
// ----------------------------------------
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("message", (data) => {
    console.log("📩 Message received:", data);
  });

  socket.on("join-user", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User room joined: user_${userId}`);
  });

  socket.on("join-vehicle", (vehicleId: string) => {
    socket.join(`vehicle_${vehicleId}`);
    console.log(`🚗 Joined vehicle room: vehicle_${vehicleId}`);
  });

  socket.on("leave-vehicle", (vehicleId: string) => {
    socket.leave(`vehicle_${vehicleId}`);
    console.log(`🚙 Left vehicle room: vehicle_${vehicleId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ----------------------------------------
// EXPRESS MIDDLEWARE
// ----------------------------------------
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use("/api", rateLimiter(100, 15 * 60 * 1000));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(sanitizeInput);

app.use(
  process.env.NODE_ENV === "development"
    ? morgan("dev")
    : morgan("combined")
);

// ----------------------------------------
// HEALTH CHECK
// ----------------------------------------
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Simple test route
app.get("/", (_req, res) => {
  res.send("Backend running with Socket.io enabled");
});

// ----------------------------------------
// ROUTES
// ----------------------------------------
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/test-drives", testDriveRoutes);
app.use("/api/financing", financingRoutes);
app.use("/api/trade-ins", tradeInRoutes);
app.use("/api/promotions", promotionRoutes);

// ⭐ Upload route
app.use("/api/upload", uploadRoutes);

// ⭐ NEW — Branches route
app.use("/api/branches", branchRoutes);

// ⭐ Serve static uploaded images
app.use("/uploads", express.static("uploads"));

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use(errorHandler);

// ----------------------------------------
// START SERVER
// ----------------------------------------
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.io: ws://localhost:${PORT}`);
});

export default app;
