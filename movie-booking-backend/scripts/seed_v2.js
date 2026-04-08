// scripts/seed_v2.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../src/models/Movie.js";
import Show from "../src/models/Show.js";
import Screen from "../src/models/Screen.js";
import User from "../src/models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

const movieData = [
  // Blockbusters
  { title: "Dhurandhar", language: "Hindi", genre: "Action", poster: "/movies/Blockbusters/Dhurandhar.jpeg", rating: "A", duration: "2h 35m" },
  { title: "The Kerala Story 2", language: "Hindi", genre: "Drama", poster: "/movies/Blockbusters/The Kerala Story 2.jpeg", rating: "A", duration: "2h 30m" },
  { title: "The Kerala Story", language: "Hindi", genre: "Drama", poster: "/movies/Blockbusters/The Kerala Story.jpeg", rating: "A", duration: "2h 20m" },
  { title: "The Kashmir Files", language: "Hindi", genre: "Drama", poster: "/movies/Blockbusters/The kashmir files.jpeg", rating: "A", duration: "2h 50m" },

  // English
  { title: "Avengers", language: "English", genre: "Action", poster: "/movies/English/Avenger.jpeg", rating: "U/A", duration: "2h 23m" },
  { title: "Avengers: Age of Ultron", language: "English", genre: "Action", poster: "/movies/English/Avengers Age of Ultron.jpeg", rating: "U/A", duration: "2h 21m" },
  { title: "Avengers: Endgame", language: "English", genre: "Action", poster: "/movies/English/Avengers Endgame.jpeg", rating: "U/A", duration: "3h 02m" },
  { title: "Infinity War", language: "English", genre: "Action", poster: "/movies/English/Infinity War.jpeg", rating: "U/A", duration: "2h 29m" },

  // Hindi
  { title: "Dil Wale Dulhaniya Lejayenge", language: "Hindi", genre: "Romance", poster: "/movies/Hindi/Dil Wale Dulhaniya Lejayenge.jpeg", rating: "U", duration: "3h 09m" },
  { title: "Ek Vivah Aisa Bhi", language: "Hindi", genre: "Drama", poster: "/movies/Hindi/Ek Vivah Aisa Bhi.jpeg", rating: "U", duration: "2h 15m" },
  { title: "Hum Aapke Hain Koun", language: "Hindi", genre: "Drama", poster: "/movies/Hindi/Hum Aapke Hain Koun.jpeg", rating: "U", duration: "3h 26m" },
  { title: "Hum Sath Sath Hain", language: "Hindi", genre: "Drama", poster: "/movies/Hindi/Hum sath sath Hain.jpeg", rating: "U", duration: "2h 50m" },

  // Inspirational
  { title: "3 Idiots", language: "Hindi", genre: "Comedy/Drama", poster: "/movies/Inspirational/3 idiots.jpeg", rating: "U/A", duration: "2h 50m" },
  { title: "Chhichhore", language: "Hindi", genre: "Drama", poster: "/movies/Inspirational/Chhichhore.jpeg", rating: "U/A", duration: "2h 23m" },
  { title: "Ms Dhoni: The Untold Story", language: "Hindi", genre: "Biographical", poster: "/movies/Inspirational/Ms Dhoni The Untold Story.jpeg", rating: "U/A", duration: "3h 10m" },
  { title: "Shabaash Mithu", language: "Hindi", genre: "Biographical", poster: "/movies/Inspirational/Shabaash Mithu.jpeg", rating: "U/A", duration: "2h 42m" },

  // Marathi
  { title: "Baipan Bhari Deva", language: "Marathi", genre: "Drama", poster: "/movies/Marathi/Baipan Bhari Deva.jpeg", rating: "U", duration: "2h 30m" },
  { title: "Sairat", language: "Marathi", genre: "Romance", poster: "/movies/Marathi/Sairat.jpeg", rating: "U/A", duration: "2h 54m" },
  { title: "Chi Wa Chi Sou Ka", language: "Marathi", genre: "Comedy/Romance", poster: "/movies/Marathi/chi wa chi sou ka.jpeg", rating: "U", duration: "2h 15m" },
  { title: "Mangalashtak Once More", language: "Marathi", genre: "Romance/Comedy", poster: "/movies/Marathi/mannglakast once more.jpeg", rating: "U", duration: "2h 10m" },
];

function generateSeats(rowsNum = 8, colsNum = 12) {
  const seats = [];
  const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  rowLabels.slice(0, rowsNum).forEach((r) => {
    for (let i = 1; i <= colsNum; i++) {
      seats.push({
        seatNo: `${r}${i}`,
        status: "available",
        lockedBy: null,
        lockedAt: null,
      });
    }
  });
  return seats;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Show.deleteMany({});
    await Movie.deleteMany({});
    await Screen.deleteMany({});
    console.log("🗑️  Cleared existing movies, shows, and screens");

    // Create Screens
    const screens = await Screen.insertMany([
      { name: "Screen 1", rows: 8, seatsPerRow: 12 },
      { name: "Screen 2", rows: 8, seatsPerRow: 12 },
      { name: "Screen 3", rows: 8, seatsPerRow: 12 },
      { name: "Screen 4", rows: 8, seatsPerRow: 12 },
    ]);
    console.log(`🎬 Created ${screens.length} screens`);

    // Create Movies
    const insertedMovies = await Movie.insertMany(movieData);
    console.log(`🎬 Inserted ${insertedMovies.length} movies`);

    // Create Shows
    const showsToInsert = [];
    let screenIdx = 0;
    const times = [
      new Date("2026-04-10T10:00:00"),
      new Date("2026-04-10T14:00:00"),
      new Date("2026-04-10T18:00:00"),
      new Date("2026-04-10T22:00:00"),
    ];

    insertedMovies.forEach((movie, idx) => {
      let price = 1; // Default "1 rupess"
      
      if (movie.poster.includes("/Hindi/") || movie.poster.includes("/Marathi/")) {
        price = 2;
      } else if (movie.poster.includes("/Blockbusters/") || movie.poster.includes("/Inspirational/")) {
        price = 3;
      }

      showsToInsert.push({
        movie: movie._id,
        screen: screens[screenIdx % screens.length]._id,
        showTime: times[idx % times.length],
        price: price,
        seats: generateSeats(),
      });
      screenIdx++;
    });

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`📅 Created ${insertedShows.length} shows`);

    await mongoose.disconnect();
    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
