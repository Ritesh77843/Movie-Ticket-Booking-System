import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatNo: { type: String, required: true }, // e.g., A1, A2
    status: { type: String, enum: ["available", "locked", "booked", "blocked"], default: "available" },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true },
    showTime: { type: Date, required: true },
    price: { type: Number, required: true },
    seats: [seatSchema],
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
