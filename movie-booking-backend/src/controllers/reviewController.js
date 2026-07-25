import Review from "../models/Review.js";
import Movie from "../models/Movie.js";

// Add a Review
export const addReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const existingReview = await Review.findOne({ user: userId, movie: movieId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this movie" });
        }

        const review = await Review.create({ user: userId, movie: movieId, rating, comment });

        // Recalculate average rating
        const reviews = await Review.find({ movie: movieId });
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

        await Movie.findByIdAndUpdate(movieId, { averageRating: avg, totalReviews: reviews.length });

        res.status(201).json({ message: "Review posted successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Reviews for a Movie
export const getReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movie: movieId })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
