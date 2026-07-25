import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./src/models/Movie.js";

dotenv.config();

const fixPosters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const movies = await Movie.find({});
        let updated = 0;

        for (let movie of movies) {
            if (movie.poster && movie.poster.startsWith("/") && movie.poster.length > 20) { // typical TMDB path like /fw02ONlDhrYjTSZV8XO6qaU3ev.jpg
                movie.poster = `https://image.tmdb.org/t/p/w500${movie.poster}`;
                await movie.save();
                updated++;
            }
        }

        console.log(`✅ Fixed ${updated} movie posters to use absolute TMDB domain!`);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixPosters();
