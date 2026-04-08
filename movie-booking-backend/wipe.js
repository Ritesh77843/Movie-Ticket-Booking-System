import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const wipe = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movie-booking");
    await mongoose.connection.db.collection('shows').drop().catch(() => console.log('shows not found'));
    await mongoose.connection.db.collection('movies').drop().catch(() => console.log('movies not found'));
    await mongoose.connection.db.collection('screens').drop().catch(() => console.log('screens not found'));
    console.log("DB wiped properly!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
wipe();
