import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        image: { type: String, default: "/popcorn_placeholder.png" },
        type: { type: String, enum: ["snack", "beverage", "combo"], default: "snack" },
    },
    { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
