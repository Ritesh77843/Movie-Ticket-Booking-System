import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";
import Movie from "../src/models/Movie.js";
import Theater from "../src/models/Theater.js";
import Screen from "../src/models/Screen.js";
import Show from "../src/models/Show.js";
import Booking from "../src/models/Booking.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

function generateSeats(rows = 5, cols = 10) {
  const seats = [];
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatNo: `${rowLetters[r]}${c}`,
        status: "available",
      });
    }
  }
  return seats;
}

// ============ ALL THEATERS DATA ============
const theatersData = [
  // --- MUMBAI: Western Line ---
  { name: "PVR Oberoi Mall, Goregaon", location: "Mumbai", subLocation: "Western Line", address: "Oberoi Mall, Goregaon West, Mumbai", screens: 6 },
  { name: "PVR Citi Mall, Andheri", location: "Mumbai", subLocation: "Western Line", address: "Citi Mall, Andheri West, Mumbai", screens: 4 },
  { name: "INOX Raghuleela, Kandivali", location: "Mumbai", subLocation: "Western Line", address: "Raghuleela Mall, Kandivali West, Mumbai", screens: 4 },
  { name: "Cinepolis Andheri West", location: "Mumbai", subLocation: "Western Line", address: "Fun Republic, Andheri West, Mumbai", screens: 5 },
  { name: "Movietime Borivali", location: "Mumbai", subLocation: "Western Line", address: "Borivali West, Mumbai", screens: 3 },
  { name: "Carnival Cinemas Borivali", location: "Mumbai", subLocation: "Western Line", address: "Borivali East, Mumbai", screens: 3 },

  // --- MUMBAI: Central Line ---
  { name: "INOX Viviana Mall, Thane", location: "Mumbai", subLocation: "Central Line", address: "Viviana Mall, Eastern Express Highway, Thane", screens: 6 },
  { name: "INOX Korum Mall, Thane", location: "Mumbai", subLocation: "Central Line", address: "Korum Mall, Thane West", screens: 4 },
  { name: "Cinepolis Bhandup", location: "Mumbai", subLocation: "Central Line", address: "Neptune Mall, Bhandup West, Mumbai", screens: 5 },
  { name: "Carnival Mulund", location: "Mumbai", subLocation: "Central Line", address: "Mulund West, Mumbai", screens: 3 },
  { name: "PVR Metro Junction, Kalyan", location: "Mumbai", subLocation: "Central Line", address: "Metro Junction Mall, Kalyan West", screens: 5 },

  // --- NAVI MUMBAI / Harbour ---
  { name: "INOX Inorbit Mall, Vashi", location: "Navi Mumbai", subLocation: "Vashi", address: "Inorbit Mall, Sector 30A, Vashi", screens: 4 },
  { name: "Cinepolis Seawoods Grand Central", location: "Navi Mumbai", subLocation: "Seawoods", address: "Seawoods Grand Central, Navi Mumbai", screens: 6 },
  { name: "PVR Orion Mall, Panvel", location: "Navi Mumbai", subLocation: "Panvel", address: "Orion Mall, Panvel, Navi Mumbai", screens: 5 },
  { name: "Miraj Cinemas Panvel", location: "Navi Mumbai", subLocation: "Panvel", address: "Panvel, Navi Mumbai", screens: 3 },
  { name: "Carnival Cinemas Vashi", location: "Navi Mumbai", subLocation: "Vashi", address: "Vashi, Navi Mumbai", screens: 3 },

  // --- SOUTH MUMBAI (Legacy) ---
  { name: "Regal Cinema, Colaba", location: "Mumbai", subLocation: "South Mumbai", address: "Colaba Causeway, Mumbai", screens: 1 },
  { name: "Eros Cinema, Churchgate", location: "Mumbai", subLocation: "South Mumbai", address: "Cambata Building, Churchgate, Mumbai", screens: 1 },
  { name: "Metro INOX, Marine Lines", location: "Mumbai", subLocation: "South Mumbai", address: "M.G. Road, Marine Lines, Mumbai", screens: 4 },
  { name: "New Excelsior, Fort", location: "Mumbai", subLocation: "South Mumbai", address: "Fort, Mumbai", screens: 1 },

  // --- PUNE: Major Multiplexes ---
  { name: "PVR Phoenix Marketcity, Viman Nagar", location: "Pune", subLocation: "Viman Nagar", address: "Phoenix Marketcity, Viman Nagar, Pune", screens: 8 },
  { name: "INOX Bund Garden", location: "Pune", subLocation: "Camp", address: "Bund Garden Road, Pune", screens: 5 },
  { name: "Cinepolis Seasons Mall, Hadapsar", location: "Pune", subLocation: "Hadapsar", address: "Seasons Mall, Magarpatta, Hadapsar, Pune", screens: 6 },
  { name: "PVR Kumar Pacific Mall", location: "Pune", subLocation: "Swargate", address: "Kumar Pacific Mall, Swargate, Pune", screens: 4 },
  { name: "City Pride Kothrud", location: "Pune", subLocation: "Kothrud", address: "Kothrud, Pune", screens: 4 },
  { name: "City Pride Satara Road", location: "Pune", subLocation: "Satara Road", address: "Satara Road, Pune", screens: 4 },
  // Pune Single Screens
  { name: "Alka Talkies", location: "Pune", subLocation: "Camp", address: "Camp, Pune", screens: 1 },
  { name: "Vijay Theatre", location: "Pune", subLocation: "Deccan", address: "Deccan Gymkhana, Pune", screens: 1 },

  // --- DELHI: Premium Multiplexes ---
  { name: "PVR Select Citywalk, Saket", location: "Delhi", subLocation: "South Delhi", address: "Select Citywalk, Saket, New Delhi", screens: 6 },
  { name: "PVR Logix Noida", location: "Delhi", subLocation: "Noida", address: "Logix City Centre, Sector 32, Noida", screens: 8 },
  { name: "INOX Nehru Place", location: "Delhi", subLocation: "South Delhi", address: "Nehru Place, New Delhi", screens: 4 },
  { name: "Cinepolis Janakpuri", location: "Delhi", subLocation: "West Delhi", address: "Unity One Mall, Janakpuri, New Delhi", screens: 5 },
  { name: "PVR Pacific Mall, Subhash Nagar", location: "Delhi", subLocation: "West Delhi", address: "Pacific Mall, Subhash Nagar, New Delhi", screens: 6 },
  // Delhi Large Capacity
  { name: "PVR Ambience Mall, Vasant Kunj", location: "Delhi", subLocation: "South Delhi", address: "Ambience Mall, Vasant Kunj, New Delhi", screens: 7 },
  { name: "Carnival Cinemas Shahdara", location: "Delhi", subLocation: "East Delhi", address: "Shahdara, New Delhi", screens: 3 },
  { name: "Delite Cinema", location: "Delhi", subLocation: "Central Delhi", address: "Asaf Ali Road, New Delhi", screens: 1 },
];

// ============ MOVIES DATA ============
const moviesData = [
  // Hindi
  { title: "Dil Wale Dulhaniya Lejayenge", poster: "/movies/Hindi/Dil Wale Dulhaniya Lejayenge.jpeg", genre: "Romance", language: "Hindi", rating: "U", duration: "3h 10m" },
  { title: "Ek Vivah Aisa Bhi", poster: "/movies/Hindi/Ek Vivah Aisa Bhi.jpeg", genre: "Drama", language: "Hindi", rating: "U", duration: "2h 15m" },
  { title: "Hum Aapke Hain Koun", poster: "/movies/Hindi/Hum Aapke Hain Koun.jpeg", genre: "Musical Romance", language: "Hindi", rating: "U", duration: "3h 26m" },
  { title: "Hum sath sath Hain", poster: "/movies/Hindi/Hum sath sath Hain.jpeg", genre: "Family Drama", language: "Hindi", rating: "U", duration: "2h 50m" },
  // Marathi
  { title: "Baipan Bhari Deva", poster: "/movies/Marathi/Baipan Bhari Deva.jpeg", genre: "Comedy Drama", language: "Marathi", rating: "U", duration: "2h 20m" },
  { title: "Sairat", poster: "/movies/Marathi/Sairat.jpeg", genre: "Romance Drama", language: "Marathi", rating: "A", duration: "2h 54m" },
  { title: "chi wa chi sou ka", poster: "/movies/Marathi/chi wa chi sou ka.jpeg", genre: "Comedy", language: "Marathi", rating: "U", duration: "2h 10m" },
  { title: "mannglakast once more", poster: "/movies/Marathi/mannglakast once more.jpeg", genre: "Family", language: "Marathi", rating: "U", duration: "2h 15m" },
  // English
  { title: "Avenger", poster: "/movies/English/Avenger.jpeg", genre: "Action", language: "English", rating: "U/A", duration: "2h 23m" },
  { title: "Avengers Age of Ultron", poster: "/movies/English/Avengers Age of Ultron.jpeg", genre: "Action", language: "English", rating: "U/A", duration: "2h 21m" },
  { title: "Avengers Endgame", poster: "/movies/English/Avengers Endgame.jpeg", genre: "Sci-Fi/Action", language: "English", rating: "U/A", duration: "3h 1m" },
  { title: "Infinity War", poster: "/movies/English/Infinity War.jpeg", genre: "Action", language: "English", rating: "U/A", duration: "2h 29m" },
  // Blockbusters
  { title: "Dhurandhar", poster: "/movies/Blockbusters/Dhurandhar.jpeg", genre: "Action", language: "Hindi", rating: "A", duration: "2h 40m" },
  { title: "The Kerala Story 2", poster: "/movies/Blockbusters/The Kerala Story 2.jpeg", genre: "Drama", language: "Hindi", rating: "A", duration: "2h 10m" },
  { title: "The Kerala Story", poster: "/movies/Blockbusters/The Kerala Story.jpeg", genre: "Drama", language: "Hindi", rating: "A", duration: "2h 18m" },
  { title: "The kashmir files", poster: "/movies/Blockbusters/The kashmir files.jpeg", genre: "Historical Drama", language: "Hindi", rating: "A", duration: "2h 50m" },
  // Inspirational
  { title: "3 idiots", poster: "/movies/Inspirational/3 idiots.jpeg", genre: "Comedy/Drama", language: "Hindi", rating: "U/A", duration: "2h 50m" },
  { title: "Chhichhore", poster: "/movies/Inspirational/Chhichhore.jpeg", genre: "Drama/Comedy", language: "Hindi", rating: "U/A", duration: "2h 23m" },
  { title: "Ms Dhoni The Untold Story", poster: "/movies/Inspirational/Ms Dhoni The Untold Story.jpeg", genre: "Biographical Sports", language: "Hindi", rating: "U", duration: "3h 10m" },
  { title: "Shabaash Mithu", poster: "/movies/Inspirational/Shabaash Mithu.jpeg", genre: "Sports Drama", language: "Hindi", rating: "U", duration: "2h 36m" },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear everything
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Screen.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    console.log("🗑️  Cleared all existing data");

    // 1. Users
    const hashedUserPassword = await bcrypt.hash("password123", 10);
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    await User.insertMany([
      { name: "John Doe", email: "john@example.com", phone: "9876543210", password: hashedUserPassword, role: "user", isVerified: true },
      { name: "Ritesh", email: "ritesh@prajapati.com", phone: "9876543211", password: hashedAdminPassword, role: "admin", isVerified: true },
      { name: "Narayan", email: "narayan@pandey.com", phone: "9876543212", password: hashedAdminPassword, role: "admin", isVerified: true },
      { name: "Anjali", email: "anjali@singh.com", phone: "9876543213", password: hashedAdminPassword, role: "admin", isVerified: true },
      { name: "Jaynesh", email: "jaynesh@patel.com", phone: "9876543214", password: hashedAdminPassword, role: "admin", isVerified: true },
    ]);
    console.log("👥 5 Users seeded (4 admin, 1 user)");

    // 2. Theaters
    const insertedTheaters = await Theater.insertMany(
      theatersData.map(t => ({ name: t.name, location: t.location, subLocation: t.subLocation, address: t.address }))
    );
    console.log(`🏢 ${insertedTheaters.length} Theaters seeded`);

    // 3. Screens — create 1 screen per theater (for simplicity, linked to shows)
    const screensToInsert = [];
    for (let i = 0; i < insertedTheaters.length; i++) {
      const t = insertedTheaters[i];
      const numScreens = theatersData[i].screens;
      // Create at least 1 screen per theater
      screensToInsert.push({
        name: numScreens === 1 ? "Main Screen" : "Screen 1",
        theater: t._id,
        rows: numScreens === 1 ? 10 : 6,
        seatsPerRow: numScreens === 1 ? 12 : 10,
      });
    }
    const insertedScreens = await Screen.insertMany(screensToInsert);
    console.log(`📺 ${insertedScreens.length} Screens seeded (1 per theater)`);

    // 4. Movies
    const insertedMovies = await Movie.insertMany(moviesData);
    console.log(`🎬 ${insertedMovies.length} Movies seeded`);

    // 5. Shows — EVERY movie plays at EVERY screen, 2 slots/day, 3 days
    const showsData = [];
    const baseSlots = [9, 12, 15, 18, 21]; // base hours

    for (let day = 0; day <= 2; day++) {
      for (let si = 0; si < insertedScreens.length; si++) {
        const screen = insertedScreens[si];
        // Each theater gets a unique time offset (0-59 mins, varies by theater index)
        const theaterMinOffset = (si * 7) % 60; // 0, 7, 14, 21, 28...
        const theaterHourShift = si % 3;         // 0, 1, 2, 0, 1, 2...

        for (let mi = 0; mi < insertedMovies.length; mi++) {
          const movie = insertedMovies[mi];
          // Pick a base slot that rotates per movie
          const baseHour = baseSlots[mi % baseSlots.length];
          // Add theater-specific offset so same movie has different time at each theater
          const finalHour = (baseHour + theaterHourShift) % 24;
          const finalMin = (theaterMinOffset + (mi % 4) * 15) % 60;

          const startTime = new Date();
          startTime.setDate(startTime.getDate() + day);
          startTime.setHours(finalHour, finalMin, 0, 0);

          showsData.push({
            movie: movie._id,
            screen: screen._id,
            showTime: startTime,
            price: [200, 250, 300, 350][mi % 4],
            seats: generateSeats(screen.rows, screen.seatsPerRow),
          });
        }
      }
    }

    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 500;
    for (let i = 0; i < showsData.length; i += BATCH_SIZE) {
      await Show.insertMany(showsData.slice(i, i + BATCH_SIZE));
      process.stdout.write(`\r🎟️  Inserted ${Math.min(i + BATCH_SIZE, showsData.length)} / ${showsData.length} shows...`);
    }
    console.log(`\n🎟️  ${showsData.length} Shows seeded (every movie at every theater, 3 days)`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   👤 john@example.com / password123 (User)");
    console.log("   🛡️  admin@example.com / admin123 (Admin)");
    console.log("   🛡️  prajapati@jai.com / admin123 (Admin)");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
