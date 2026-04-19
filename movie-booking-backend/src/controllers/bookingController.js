import Booking from "../models/Booking.js";

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "show",
        select: "movie screen showTime seats price",
        populate: [
          { path: "movie", select: "title genre posterUrl" },
          { path: "screen", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("getUserBookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({
        path: "show",
        select: "movie screen showTime price seats",
        populate: [
          { path: "movie", select: "title genre posterUrl" },
          { path: "screen", select: "name" },
        ],
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

// Cancel booking (admin only or user's own booking)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};
