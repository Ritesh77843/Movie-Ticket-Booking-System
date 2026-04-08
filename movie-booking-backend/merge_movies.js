import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./src/models/Movie.js";
import Show from "./src/models/Show.js";
import Booking from "./src/models/Booking.js"; // just in case bookings map to movies directly, though usually to shows

dotenv.config();

const mergeMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for deduplication.");

    const movies = await Movie.find({});
    console.log(`Found ${movies.length} total movies.`);

    const titleMap = new Map();

    for (const movie of movies) {
      // Normalize title a bit
      const title = movie.title.trim().toLowerCase();
      
      if (!titleMap.has(title)) {
        titleMap.set(title, [movie]);
      } else {
        titleMap.get(title).push(movie);
      }
    }

    let deletedCount = 0;
    let updatedShowsCount = 0;

    for (const [title, group] of titleMap.entries()) {
      if (group.length > 1) {
        console.log(`Found duplicates for "${title}": ${group.length} entries`);
        
        // Sort by createdAt, keep the first one as primary
        group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const primaryMovie = group[0];
        const duplicates = group.slice(1);
        
        for (const dup of duplicates) {
          // Update all shows that reference this duplicate to reference the primary movie
          const showUpdateRes = await Show.updateMany(
            { movie: dup._id },
            { $set: { movie: primaryMovie._id } }
          );
          updatedShowsCount += showUpdateRes.modifiedCount;

          // Now safely delete the duplicate movie
          await Movie.deleteOne({ _id: dup._id });
          deletedCount++;
        }
      }
    }

    console.log(`Movie deduplication complete.`);
    console.log(`Deleted ${deletedCount} duplicate movies.`);
    console.log(`Updated ${updatedShowsCount} shows to point to primary movies.`);

    process.exit();
  } catch (error) {
    console.error("Error during merge:", error);
    process.exit(1);
  }
};

mergeMovies();
