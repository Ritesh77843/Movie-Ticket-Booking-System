import Food from "../models/Food.js";

// Get all food items
export const getFoods = async (req, res) => {
    try {
        const foods = await Food.find({});
        res.json(foods);
    } catch (err) {
        console.error("getFoods error:", err);
        res.status(500).json({ message: "Failed to fetch food items" });
    }
};
