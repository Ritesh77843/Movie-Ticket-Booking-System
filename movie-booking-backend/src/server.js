import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import screenRoutes from "./routes/screenRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { startAutoUnlockJob } from "./jobs/autoUnlock.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Regular middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/movies", movieRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Expose io to controllers
app.set("io", io);

// Socket events
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-show", (showId) => {
    socket.join(showId);
    console.log(`👥 Socket ${socket.id} joined show ${showId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    startAutoUnlockJob(io);
  })
  .catch((err) => console.error("Mongo error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
