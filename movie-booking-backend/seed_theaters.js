import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./src/models/Theater.js";

dotenv.config();

const theaters = [
  // Mumbai - South Mumbai
  { name: "Regal Cinema", location: "Mumbai", subLocation: "South Mumbai", address: "Colaba" },
  { name: "Eros Cinema", location: "Mumbai", subLocation: "South Mumbai", address: "Churchgate" },
  { name: "Metro INOX", location: "Mumbai", subLocation: "South Mumbai", address: "Marine Lines" },
  { name: "New Excelsior Cinema", location: "Mumbai", subLocation: "South Mumbai", address: "Fort" },
  
  // Mumbai - Western Suburbs
  { name: "PVR Juhu", location: "Mumbai", subLocation: "Western Suburbs", address: "Juhu" },
  { name: "PVR Icon", location: "Mumbai", subLocation: "Western Suburbs", address: "Andheri West" },
  { name: "Cinepolis", location: "Mumbai", subLocation: "Western Suburbs", address: "Andheri West" },
  { name: "Fun Cinemas", location: "Mumbai", subLocation: "Western Suburbs", address: "Andheri" },
  { name: "INOX R City", location: "Mumbai", subLocation: "Western Suburbs", address: "Ghatkopar" },
  { name: "PVR Dynamix", location: "Mumbai", subLocation: "Western Suburbs", address: "Juhu" },
  
  // Mumbai - Central / Eastern
  { name: "INOX", location: "Mumbai", subLocation: "Central / Eastern", address: "Nariman Point" },
  { name: "Carnival Cinemas", location: "Mumbai", subLocation: "Central / Eastern", address: "Kurla" },
  { name: "PVR Phoenix Marketcity", location: "Mumbai", subLocation: "Central / Eastern", address: "Kurla" },
  
  // Mumbai - North Mumbai
  { name: "Cinepolis", location: "Mumbai", subLocation: "North Mumbai", address: "Thane" },
  { name: "Viviana Mall PVR", location: "Mumbai", subLocation: "North Mumbai", address: "Thane" },
  { name: "INOX", location: "Mumbai", subLocation: "North Mumbai", address: "Malad - Inorbit Mall" },
  { name: "PVR", location: "Mumbai", subLocation: "North Mumbai", address: "Oberoi Mall, Goregaon" },
  { name: "Carnival Cinemas", location: "Mumbai", subLocation: "North Mumbai", address: "Borivali" },
  
  // Navi Mumbai
  { name: "Inox Raghuleela Mall", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Vashi" },
  { name: "Cinepolis Seawoods Grand Central", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Nerul" },
  { name: "INOX Palm Beach Galleria", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Vashi" },
  { name: "Miraj Cinemas", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Kharghar" },
  { name: "Glomax Mall Cinema", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Kharghar" },
  { name: "Balaji Movieplex", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Kharghar" },
  { name: "Little World Mall Cinema", location: "Navi Mumbai", subLocation: "Navi Mumbai", address: "Kharghar" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Theater.deleteMany({});
    console.log("Cleared existing theaters");

    await Theater.insertMany(theaters);
    console.log("Seed successful: Added " + theaters.length + " theaters");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
