import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB.");

        await User.deleteMany({});
        console.log("🗑️  Cleared all existing users and admins from the database.");

        const pass1 = await bcrypt.hash("ritesh@123", 10);
        const pass2 = await bcrypt.hash("narutojanu@123", 10);

        const admins = [
            {
                name: "Ritesh Admin",
                email: "ritesh@admin",
                password: pass1,
                role: "admin",
                isVerified: true
            },
            {
                name: "Narutojanu Admin",
                email: "narutojanu@admin",
                password: pass2,
                role: "admin",
                isVerified: true
            }
        ];

        await User.insertMany(admins);
        console.log("👑 Created 2 fresh admins:");
        console.log("   ➤ ID: ritesh@admin     | Pass: ritesh@123");
        console.log("   ➤ ID: narutojanu@admin | Pass: narutojanu@123");

        console.log("\n✅ Script execution completed. Other users can register normally via the web interface.");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit(0);
    }
};

run();
