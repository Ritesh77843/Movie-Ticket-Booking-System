import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./src/models/Movie.js";
import Show from "./src/models/Show.js";

dotenv.config();

const updatePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const movies = await Movie.find({});
    
    // Categorize movies by criteria
    const hindiMarathiIds = [];
    const inspirationIds = [];
    
    movies.forEach(m => {
      const lang = (m.language || '').toLowerCase();
      const genre = (m.genre || '').toLowerCase();
      
      if (genre.includes('inspiration')) {
        inspirationIds.push(m._id);
      } else if (lang.includes('hindi') || lang.includes('marathi')) {
        hindiMarathiIds.push(m._id);
      }
    });

    // Update Shows Prices
    const res1 = await Show.updateMany(
      { movie: { $in: hindiMarathiIds } },
      { $set: { price: 2 } }
    );
    console.log(`Updated ${res1.modifiedCount} shows to 2 rupees (Hindi/Marathi)`);

    if (inspirationIds.length > 0) {
      const res2 = await Show.updateMany(
        { movie: { $in: inspirationIds } },
        { $set: { price: 3 } }
      );
      console.log(`Updated ${res2.modifiedCount} shows to 3 rupees (Inspiration)`);
    } else {
      console.log('No inspiration movies found.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updatePrices();
