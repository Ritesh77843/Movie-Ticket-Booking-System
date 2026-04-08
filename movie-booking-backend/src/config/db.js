import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast if Atlas unreachable
    });

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    process.exit(1);
  }
};
