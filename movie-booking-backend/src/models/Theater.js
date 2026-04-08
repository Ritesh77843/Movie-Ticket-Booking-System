import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true }, // e.g., "Mumbai", "Navi Mumbai"
    subLocation: { type: String, required: true }, // e.g., "South Mumbai", "Western Suburbs"
    address: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);
