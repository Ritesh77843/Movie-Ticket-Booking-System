import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: [
      {
        type: String,
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cash", "upi"],
      default: "razorpay",
    },
    paymentReferenceId: {
      type: String,
      default: null,
    },
    bookingStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    bookingTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
