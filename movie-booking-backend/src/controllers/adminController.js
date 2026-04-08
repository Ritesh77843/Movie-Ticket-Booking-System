import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// ✅ Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const activeShows = await Show.countDocuments({ showTime: { $gte: new Date() } });
    
    // Get total seats booked across all time (simplest approach for now)
    const seatsAgg = await Booking.aggregate([
      { $match: { paymentStatus: "completed", bookingStatus: "active" } },
      { $project: { seatsCount: { $size: "$seats" } } },
      { $group: { _id: null, totalSeats: { $sum: "$seatsCount" } } }
    ]);
    const totalSeatsBooked = seatsAgg.length > 0 ? seatsAgg[0].totalSeats : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "title poster" },
          { path: "screen", select: "name" }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBookings,
      totalRevenue,
      activeShows,
      totalSeatsBooked,
      recentBookings
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ✅ Get All Bookings (Admin table)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "title poster" },
          { path: "screen", select: "name" }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("getAllBookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// ✅ Admin action on booking (Verify, Cancel, Refund)
export const actionOnBooking = async (req, res) => {
  try {
    const { action } = req.body; // "cancel", "refund", "verify"
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (action === "cancel") {
      booking.bookingStatus = "cancelled";
    } else if (action === "refund") {
      booking.bookingStatus = "cancelled"; // Can't go to movie if refunded
      booking.paymentStatus = "refunded";
    } else if (action === "verify") {
      booking.paymentStatus = "completed";
      booking.bookingStatus = "completed"; // verified they watched it
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await booking.save();

    // If cancelled or refunded, we MUST forcefully unlock the seats in the Show!
    if (action === "cancel" || action === "refund") {
      const showId = booking.show;
      const seatsToFree = booking.seats;
      
      await Show.updateOne(
        { _id: showId },
        {
          $set: {
            "seats.$[elem].status": "available",
            "seats.$[elem].lockedBy": null,
            "seats.$[elem].lockedAt": null,
          },
        },
        {
          arrayFilters: [{ "elem.seatNo": { $in: seatsToFree } }],
        }
      );
    }

    res.json({ message: `Booking ${action} successful`, booking });
  } catch (err) {
    console.error("actionOnBooking error:", err);
    res.status(500).json({ message: "Failed to compute action" });
  }
};

// ✅ Admin Force Seat Status (Empty, Block, Available)
export const forceSeatStatus = async (req, res) => {
  try {
    const { seatNo, newStatus } = req.body; // status: "available", "blocked"

    if (!["available", "blocked", "booked"].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status format" });
    }

    await Show.updateOne(
      { _id: req.params.showId },
      {
        $set: {
          "seats.$[elem].status": newStatus,
          "seats.$[elem].lockedBy": null,
          "seats.$[elem].lockedAt": null,
        },
      },
      {
        arrayFilters: [{ "elem.seatNo": seatNo }],
      }
    );

    res.json({ message: `Seat ${seatNo} manually forced to ${newStatus}` });
  } catch (err) {
    console.error("forceSeatStatus error:", err);
    res.status(500).json({ message: "Failed to force seat" });
  }
};

// ✅ Admin Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ Admin Toggle Block User
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User has been ${user.isBlocked ? "blocked" : "unblocked"}`, user });
  } catch (err) {
    console.error("toggleBlockUser error:", err);
    res.status(500).json({ message: "Failed to block/unblock user" });
  }
};
