import Razorpay from "razorpay";
import crypto from "crypto";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

// Helper to get razorpay instance dynamically so it works with dotenv late-loading in ESM
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id === "your_razorpay_key_id") {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  const razorpayInstance = getRazorpayInstance();

  if (!razorpayInstance) {
    return res.status(503).json({ message: "Razorpay service not configured. Please add RAZORPAY_KEY_ID to .env" });
  }

  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const options = {
      amount: Math.round(amount), // paise
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create razorpay order" });
  }
};

// POST /api/payments/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      showId, 
      seats 
    } = req.body;

    if (!showId || !Array.isArray(seats) || seats.length === 0 || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "All payment and booking details are required" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Check for duplicate booking (idempotency guard)
    const existingBooking = await Booking.findOne({ paymentReferenceId: razorpay_payment_id });
    if (existingBooking) {
      return res.status(200).json({ message: "Booking already confirmed", booking: existingBooking, totalPrice: existingBooking.totalPrice });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

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

    // Strategy 2: If seats were auto-unlocked during payment, book them from "available" state
    // Payment is already verified, so we must honour the booking
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
      // Seats might already be booked by someone else – edge case
      // Check current state to give a useful error
      const freshShow = await Show.findById(showId);
      const seatStates = freshShow?.seats
        ?.filter(s => seats.includes(s.seatNo))
        ?.map(s => `${s.seatNo}:${s.status}`) || [];
      console.error(`verifyPayment: could not book seats. Current states: ${seatStates.join(", ")}`);
      return res.status(409).json({ message: "Seats are already booked by another user. Please contact support with your payment ID: " + razorpay_payment_id });
    }

    const totalPrice = seats.length * show.price;
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      totalPrice,
      paymentStatus: "completed",
      paymentMethod: "razorpay",
      paymentReferenceId: razorpay_payment_id,
      bookingStatus: "active",
    });

    const io = req.app.get("io");
    io.to(showId).emit("seats-updated", { showId });

    res.status(201).json({ message: "Booking confirmed", booking, totalPrice });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Failed to verify transaction" });
  }
};
