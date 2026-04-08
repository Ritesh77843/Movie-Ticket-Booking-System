import express from "express";
import {
  getDashboardStats,
  getAllBookings,
  actionOnBooking,
  forceSeatStatus,
  getAllUsers,
  toggleBlockUser,
} from "../controllers/adminController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Specific admin commands
router.get("/stats", protect, isAdmin, getDashboardStats);
router.get("/bookings", protect, isAdmin, getAllBookings);
router.post("/bookings/:id/action", protect, isAdmin, actionOnBooking);
router.post("/shows/:showId/seats/force", protect, isAdmin, forceSeatStatus);

// User Management
router.get("/users", protect, isAdmin, getAllUsers);
router.post("/users/:id/block", protect, isAdmin, toggleBlockUser);

export default router;
