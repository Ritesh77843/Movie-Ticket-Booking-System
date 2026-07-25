import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../src/models/Food.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const foodMenu = [
    {
        name: "Classic Salted Popcorn",
        description: "Large tub of perfectly salted, buttery popcorn.",
        price: 250,
        type: "snack",
        image: "🍿"
    },
    {
        name: "Cheese Nachos",
        description: "Crispy tortilla chips with hot jalapeno cheese dip.",
        price: 280,
        type: "snack",
        image: "🧀"
    },
    {
        name: "Fountain Pepsi",
        description: "Large refreshing ice-cold cola.",
        price: 150,
        type: "beverage",
        image: "🥤"
    },
    {
        name: "Couple Combo",
        description: "1 Large Popcorn + 2 Regular Pepsi",
        price: 490,
        type: "combo",
        image: "💑"
    },
    {
        name: "Hot Dog",
        description: "Classic chicken hot dog with ketchup and mustard.",
        price: 210,
        type: "snack",
        image: "🌭"
    }
];

const seedFood = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Food Seeding...");

        await Food.deleteMany({});
        console.log("Cleared old food items.");

        await Food.insertMany(foodMenu);
        console.log("🎟️ Successfully seeded Food Menu!");

        process.exit(0);
    } catch (error) {
        console.error("Food seeding failed:", error);
        process.exit(1);
    }
};

seedFood();
