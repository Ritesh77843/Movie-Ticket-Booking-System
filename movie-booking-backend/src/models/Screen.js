import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Screen 1", "IMAX"
    theater: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
    rows: { type: Number, required: true },
    seatsPerRow: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Screen", screenSchema);
