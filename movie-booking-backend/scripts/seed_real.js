import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../src/models/Movie.js";
import Show from "../src/models/Show.js";
import Theater from "../src/models/Theater.js";
import Screen from "../src/models/Screen.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
    console.error("❌ MONGO_URI not set in .env");
    process.exit(1);
}

// Realistic movie data with TMDB poster paths
const movies = [
    {
        title: "Deadpool & Wolverine",
        poster: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        genre: "Action/Comedy",
        language: "English, Hindi",
        rating: "A",
        duration: "2h 7m",
    },
    {
        title: "Dune: Part Two",
        poster: "/1pdfLvkbY9ohJlCjQH2JGqqUTTe.jpg",
        genre: "Sci-Fi/Action",
        language: "English",
        rating: "U/A",
        duration: "2h 46m",
    },
    {
        title: "Kalki 2898 AD",
        poster: "/bFqyV86wJEQbZ57B9a83B3Wp7z7.jpg",
        genre: "Sci-Fi/Action",
        language: "Telugu, Hindi",
        rating: "U/A",
        duration: "3h 1m",
    },
    {
        title: "Oppenheimer",
        poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        genre: "Drama/History",
        language: "English",
        rating: "A",
        duration: "3h 0m",
    },
    {
        title: "Stree 2",
        poster: "/suhnSpnzHE7G25Xb9A4rO3nQYQY.jpg",
        genre: "Horror/Comedy",
        language: "Hindi",
        rating: "U/A",
        duration: "2h 29m",
    },
    {
        title: "Jawan",
        poster: "/jILeVkBB2Kd1PNrqGQ1niQC51Gp.jpg",
        genre: "Action/Thriller",
        language: "Hindi",
        rating: "U/A",
        duration: "2h 49m",
    },
    {
        title: "Inside Out 2",
        poster: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        genre: "Animation/Comedy",
        language: "English",
        rating: "U",
        duration: "1h 36m",
    },
    {
        title: "Animal",
        poster: "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
        genre: "Action/Crime",
        language: "Hindi",
        rating: "A",
        duration: "3h 21m",
    }
];

function generateSeats(rows = 10, cols = 15) {
    const seats = [];
    const _letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
        let rowLetter = _letters[r % 26];
        for (let c = 1; c <= cols; c++) {
            seats.push({
                seatNo: `${rowLetter}${c}`,
                status: "available",
            });
        }
    }

    // Randomly book some seats for realism
    if (Math.random() > 0.3) {
        const bookedCount = Math.floor(Math.random() * 30);
        for (let k = 0; k < bookedCount; k++) {
            const randomIdx = Math.floor(Math.random() * seats.length);
            seats[randomIdx].status = "booked";
        }
    }
    return seats;
}

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear old sparse demo data
        await Movie.deleteMany({});
        await Show.deleteMany({});
        console.log("🗑️  Cleared existing Movies and Shows to prevent date overlaps");

        // 1. Insert Movies
        const insertedMovies = await Movie.insertMany(movies);
        console.log(`🎬 Inserted ${insertedMovies.length} genuine movies with TMDB posters.`);

        // 2. Fetch all theaters
        const theaters = await Theater.find();
        if (theaters.length === 0) {
            console.log("⚠️  No theaters found. Please ensure you have created a theater first (or run standard theater seeder).");
            process.exit();
        }

        // 3. Create Shows aligned to TODAY
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of day relative current TZ

        // Day offsets: 0 (Today), 1 (Tomorrow), 2 (Day After)
        const availableOffsets = [0, 1, 2];
        const hourSlots = [10, 13, 16, 19, 21]; // 10AM, 1PM, 4PM, 7PM, 9PM

        let showsCreated = 0;

        for (const theater of theaters) {
            // Find or create screen for this theater
            let screen = await Screen.findOne({ theater: theater._id });
            if (!screen) {
                screen = await Screen.create({
                    name: "Screen 1 IMAX",
                    theater: theater._id,
                    rows: 10,
                    seatsPerRow: 15
                });
            }

            // Assign shows for alternating movies in this theater
            // Pick 3 random movies for this specific theater
            const selectedMovies = insertedMovies.sort(() => 0.5 - Math.random()).slice(0, 3);

            for (const offset of availableOffsets) {
                for (let sIdx = 0; sIdx < hourSlots.length; sIdx++) {

                    // Base calculated date
                    const showDate = new Date(today.getTime());
                    showDate.setDate(showDate.getDate() + offset);
                    showDate.setHours(hourSlots[sIdx]);

                    const assignedMovie = selectedMovies[sIdx % selectedMovies.length];
                    const price = assignedMovie.rating === "A" ? 350 : 250;

                    await Show.create({
                        movie: assignedMovie._id,
                        screen: screen._id,
                        showTime: showDate,
                        price: price,
                        seats: generateSeats(screen.rows, screen.seatsPerRow)
                    });
                    showsCreated++;
                }
            }
        }

        console.log(`🎟️  Successfully generated ${showsCreated} dynamic shows starting from Today!`);
        console.log("✅ Dates are now perfectly aligned to the present.");

    } catch (err) {
        console.error("❌ Seeding Error:", err);
    } finally {
        process.exit(0);
    }
};

run();
