import express from "express";
import {
  getUserBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all user bookings (protected)
router.get("/", protect, getUserBookings);

// Get specific booking (protected)
router.get("/:id", protect, getBookingById);

// Cancel booking (protected)
router.post("/:id/cancel", protect, cancelBooking);

export default router;
