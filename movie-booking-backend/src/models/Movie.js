import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    poster: { type: String, default: "/placeholder.jpg" },
    genre: { type: String, default: "Drama" },
    language: { type: String, default: "Hindi" },
    rating: { type: String, default: "U/A" },
    duration: { type: String, default: "2h 20m" },
  },
  { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);
