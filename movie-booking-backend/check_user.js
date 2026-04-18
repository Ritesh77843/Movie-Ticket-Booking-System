import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "john@example.com" });
    if (!user) {
      console.log("User not found!");
    } else {
      console.log("User found:", user.email);
      const ok = await bcrypt.compare("password123", user.password);
      console.log("Password check 'password123':", ok);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
checkUser();
