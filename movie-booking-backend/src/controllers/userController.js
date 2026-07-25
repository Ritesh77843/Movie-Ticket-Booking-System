import User from "../models/User.js";

// Toggle Wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Initialize wishlist if undefined
        if (!user.wishlist) user.wishlist = [];

        const isSaved = user.wishlist.includes(movieId);
        if (isSaved) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== movieId.toString());
        } else {
            user.wishlist.push(movieId);
        }
        await user.save();

        res.json({ message: isSaved ? "Removed from wishlist" : "Added to wishlist", wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}

// Get Wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}
