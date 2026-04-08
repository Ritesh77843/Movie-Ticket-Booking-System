// scripts/seed.js
// Run with: node scripts/seed.js
// Make sure .env is configured with MONGODB_URI

import mongoose from "mongoose";
import dotenv from "dotenv";
import Show from "../src/models/Show.js";
import User from "../src/models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

// Helper to generate standard seat layout (rows A-E, 10 seats each)
function generateSeats(rows = ["A", "B", "C", "D", "E"], cols = 10) {
  const seats = [];
  rows.forEach((r) => {
    for (let i = 1; i <= cols; i++) {
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

// Movie data — one show per movie
const movies = [
  {
    movieTitle: "Dhurandhar: The Revenge",
    poster: "/poster_dhurandhar.png",
    genre: "Action",
    language: "Hindi",
    rating: "A",
    duration: "2h 35m",
    screen: "Screen 1",
    showTime: new Date("2026-04-01T10:00:00"),
    price: 250,
  },
  {
    movieTitle: "Ustaad Bhagat Singh",
    poster: "/poster_ustaad.png",
    genre: "Historical Drama",
    language: "Hindi",
    rating: "U/A",
    duration: "2h 50m",
    screen: "Screen 2",
    showTime: new Date("2026-04-01T13:00:00"),
    price: 300,
  },
  {
    movieTitle: "Toxic: A Fairy Tale for Grown-Ups",
    poster: "/poster_toxic.png",
    genre: "Dark Fantasy",
    language: "Hindi",
    rating: "A",
    duration: "2h 10m",
    screen: "Screen 3",
    showTime: new Date("2026-04-01T16:00:00"),
    price: 200,
  },
  {
    movieTitle: "Youth",
    poster: "/poster_youth.png",
    genre: "Drama",
    language: "Hindi",
    rating: "U/A",
    duration: "2h 20m",
    screen: "Screen 4",
    showTime: new Date("2026-04-01T18:30:00"),
    price: 180,
  },
  {
    movieTitle: "Mardaani 3",
    poster: "/poster_mardaani3.png",
    genre: "Action Thriller",
    language: "Hindi",
    rating: "U/A",
    duration: "2h 15m",
    screen: "Screen 1",
    showTime: new Date("2026-04-02T10:00:00"),
    price: 220,
  },
  {
    movieTitle: "O' Romeo",
    poster: "/poster_o_romeo.png",
    genre: "Romance",
    language: "Malayalam",
    rating: "U",
    duration: "2h 5m",
    screen: "Screen 2",
    showTime: new Date("2026-04-02T13:00:00"),
    price: 200,
  },
  {
    movieTitle: "Thaai Kizhavi",
    poster: "/poster_thaai_kizhavi.svg",
    genre: "Drama",
    language: "Tamil",
    rating: "U",
    duration: "2h 25m",
    screen: "Screen 3",
    showTime: new Date("2026-04-02T16:00:00"),
    price: 190,
  },
  {
    movieTitle: "Border 2",
    poster: "/poster_border2.svg",
    genre: "War Action",
    language: "Hindi",
    rating: "U/A",
    duration: "2h 45m",
    screen: "Screen 4",
    showTime: new Date("2026-04-02T19:00:00"),
    price: 280,
  },
  {
    movieTitle: "Village Rockstars 2",
    poster: "/poster_village_rockstars2.svg",
    genre: "Drama",
    language: "Assamese",
    rating: "U",
    duration: "1h 55m",
    screen: "Screen 1",
    showTime: new Date("2026-04-03T10:00:00"),
    price: 150,
  },
  {
    movieTitle: "Boong",
    poster: "/poster_boong.svg",
    genre: "Animated Adventure",
    language: "Hindi",
    rating: "U",
    duration: "1h 45m",
    screen: "Screen 2",
    showTime: new Date("2026-04-03T12:00:00"),
    price: 160,
  },
  {
    movieTitle: "Kerala Story 2",
    poster: "/poster_kerala_story2.svg",
    genre: "Drama",
    language: "Malayalam",
    rating: "U/A",
    duration: "2h 30m",
    screen: "Screen 3",
    showTime: new Date("2026-04-03T15:00:00"),
    price: 220,
  },
];

// Test users to create
const testUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    password: "password123",
    role: "user",
    isVerified: true,
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    phone: "9876543211",
    password: "admin123",
    role: "admin",
    isVerified: true,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "9876543212",
    password: "password123",
    role: "user",
    isVerified: true,
  },
  {
    name: "Prajapati",
    email: "prajapati@jai.com",
    phone: "9876543213",
    password: "admin123",
    role: "admin",
    isVerified: true,
  },
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Show.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing shows and users");

    // Insert test users
    const usersToInsert = await Promise.all(
      testUsers.map(async (u) => ({
        ...u,
        password: await hashPassword(u.password),
      }))
    );

    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`👥 Inserted ${insertedUsers.length} test users:`);
    insertedUsers.forEach((u) =>
      console.log(`   ✅ ${u.name} (${u.email}) - Role: ${u.role}`)
    );

    // Insert all movies with seat layouts
    const showsToInsert = movies.map((m) => ({
      ...m,
      seats: generateSeats(),
    }));

    const inserted = await Show.insertMany(showsToInsert);
    console.log(`\n🎬 Inserted ${inserted.length} movies:`);
    inserted.forEach((s) => console.log(`   ✅ ${s.movieTitle}`));

    await mongoose.disconnect();
    console.log("\n✅ Seeding complete. Database disconnected.");
    console.log("\n📝 Test Credentials:");
    console.log("   👤 Email: john@example.com | Password: password123 (User)");
    console.log("   🛡️  Email: admin@example.com | Password: admin123 (Admin)");
    console.log("   👤 Email: jane@example.com | Password: password123 (User)");
    console.log("   🛡️  Email: prajapati@jai.com | Password: admin123 (Admin)");
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
