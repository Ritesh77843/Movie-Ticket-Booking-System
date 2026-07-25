import mongoose from "mongoose";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import Booking from "../models/Booking.js";

// ✅ Get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({}, { seats: 0 })
      .populate("movie")
      .populate("screen")
      .sort({ createdAt: -1 });
    res.json(shows);
  } catch (err) {
    console.error("getAllShows error:", err);
    res.status(500).json({ message: "Failed to fetch shows" });
  }
};

// ✅ Admin: create a show with seat layout based on Screen
export const createShow = async (req, res) => {
  try {
    const { movieId, screenId, showTime, price } = req.body;

    if (!movieId || !screenId || !showTime || !price) {
      return res
        .status(400)
        .json({ message: "movieId, screenId, showTime, price are required" });
    }

    const screenData = await Screen.findById(screenId);
    if (!screenData) {
      return res.status(404).json({ message: "Selected Screen not found" });
    }

    const movieData = await Movie.findById(movieId);
    if (!movieData) {
      return res.status(404).json({ message: "Selected Movie not found" });
    }

    // Auto-generate layout based on Screen definitions
    const seats = [];
    const _letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < screenData.rows; r++) {
      let rowLetter = _letters[r % 26]; // simple A-Z handling
      for (let i = 1; i <= screenData.seatsPerRow; i++) {
        seats.push({
          seatNo: `${rowLetter}${i}`,
          status: "available",
          lockedBy: null,
          lockedAt: null,
        });
      }
    }

    const show = await Show.create({
      movie: movieId,
      screen: screenId,
      showTime,
      price,
      seats,
    });

    res.status(201).json(show);
  } catch (err) {
    console.error("createShow error:", err);
    res.status(500).json({ message: "Failed to create show" });
  }
};

// ✅ Get show by id
export const getShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie")
      .populate("screen");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (err) {
    console.error("getShow error:", err);
    res.status(500).json({ message: "Failed to fetch show" });
  }
};

// ✅ Lock seats
export const lockSeats = async (req, res) => {
  try {
    const showId = req.params.id;
    const seats = req.body?.seats;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "seats[] are required in body" });
    }

    const now = new Date();

    const result = await Show.updateOne(
      {
        _id: showId,
        seats: {
          $not: {
            $elemMatch: {
              seatNo: { $in: seats },
              status: { $ne: "available" }
            }
          }
        }
      },
      {
        $set: {
          "seats.$[elem].status": "locked",
          "seats.$[elem].lockedBy": new mongoose.Types.ObjectId(req.user._id),
          "seats.$[elem].lockedAt": now,
        },
      },
      {
        arrayFilters: [
          { "elem.seatNo": { $in: seats }, "elem.status": "available" },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(409)
        .json({ message: "One or more seats are not available" });
    }

    const io = req.app.get("io");
    io.to(showId).emit("seats-updated", { showId });

    res.json({ message: "Seats locked", seats });
  } catch (err) {
    console.error("lockSeats error:", err);
    res.status(500).json({ message: "Failed to lock seats" });
  }
};

// ✅ Confirm booking
export const confirmBooking = async (req, res) => {
  try {
    const showId = req.params.id;
    const seats = req.body?.seats;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "seats[] are required in body" });
    }

    // Get the show to calculate total price
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // Strategy 1: Try to mark locked seats (locked by this user) as booked
    let result = await Show.updateOne(
      {
        _id: showId,
        seats: {
          $not: {
            $elemMatch: {
              seatNo: { $in: seats },
              $or: [
                { status: { $ne: "locked" } },
                { lockedBy: { $ne: req.user._id } }
              ]
            }
          }
        }
      },
      {
        $set: {
          "seats.$[elem].status": "booked",
          "seats.$[elem].lockedBy": null,
          "seats.$[elem].lockedAt": null,
        },
      },
      {
        arrayFilters: [
          {
            "elem.seatNo": { $in: seats },
            "elem.lockedBy": req.user._id,
            "elem.status": "locked",
          },
        ],
      }
    );

    // Strategy 2: If seats were auto-unlocked during payment, book from "available"
    if (result.modifiedCount === 0) {
      result = await Show.updateOne(
        {
          _id: showId,
          seats: {
            $not: {
              $elemMatch: {
                seatNo: { $in: seats },
                status: { $ne: "available" }
              }
            }
          }
        },
        {
          $set: {
            "seats.$[elem].status": "booked",
            "seats.$[elem].lockedBy": null,
            "seats.$[elem].lockedAt": null,
          },
        },
        {
          arrayFilters: [
            {
              "elem.seatNo": { $in: seats },
              "elem.status": "available",
            },
          ],
        }
      );
    }

    if (result.modifiedCount === 0) {
      return res
        .status(409)
        .json({ message: "Seats are already booked by another user" });
    }

    // Create booking record
    let foodPrice = 0;
    const foodItems = req.body?.foodItems || [];
    if (foodItems.length > 0) {
      foodItems.forEach(item => {
        foodPrice += (item.price * item.quantity);
      });
    }

    const totalPrice = (seats.length * show.price) + foodPrice;

    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      foodItems,
      totalPrice,
      paymentStatus: "completed",
      paymentMethod: "upi",
      bookingStatus: "active",
    });

    const io = req.app.get("io");
    io.to(showId).emit("seats-updated", { showId });

    res.json({
      message: "Booking confirmed",
      seats,
      booking,
      totalPrice
    });
  } catch (err) {
    console.error("confirmBooking error:", err);
    res.status(500).json({ message: "Failed to confirm booking" });
  }
};

// ✅ Admin: Update show time and price
export const updateShow = async (req, res) => {
  try {
    const { showTime, price } = req.body;
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { ...(showTime && { showTime }), ...(price !== undefined && { price }) },
      { new: true }
    ).populate("movie").populate("screen");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (err) {
    console.error("updateShow error:", err);
    res.status(500).json({ message: "Failed to update show" });
  }
};

// ✅ Admin: Delete a show
export const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ message: "Show deleted successfully" });
  } catch (err) {
    console.error("deleteShow error:", err);
    res.status(500).json({ message: "Failed to delete show" });
  }
};
