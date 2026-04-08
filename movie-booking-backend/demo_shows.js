import mongoose from "mongoose";
import dotenv from "dotenv";
import Theater from "./src/models/Theater.js";
import Screen from "./src/models/Screen.js";
import Movie from "./src/models/Movie.js";
import Show from "./src/models/Show.js";

dotenv.config();

const createDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for 4-slot demo seeding");

    // All movies to seed shows for
    const movies = await Movie.find();
    if (movies.length === 0) {
      console.log("No movies found to create shows.");
      process.exit();
    }

    const theaters = await Theater.find();
    console.log(`Found ${theaters.length} theaters`);

    for (let tIndex = 0; tIndex < theaters.length; tIndex++) {
      const theater = theaters[tIndex];

      // Create a screen for this theater if none exists
      let screen = await Screen.findOne({ theater: theater._id });
      if (!screen) {
        screen = await Screen.create({
          name: "Screen 1",
          theater: theater._id,
          rows: 10,
          seatsPerRow: 12
        });
        console.log(`Created Screen for ${theater.name}`);
      }

      // We will seed all movies playing across these theaters for variety
      for (const movie of movies) {
        // Clear old shows for this specific movie/screen to avoid clutter
        await Show.deleteMany({ screen: screen._id, movie: movie._id });

        // Base timings will be distributed starting from 9 AM, 12 PM, 3 PM, 6 PM etc.
        // We'll alternate hour offsets by theater index so each theater's time feels unique
        
        const hourOffset = (tIndex * 2) % 4; // Distributes start times loosely (0, 2, 4, 8)
        
        // Let's create an array of 4 timestamps for a future date
        const baseDate = "2026-04-12T";
        const slots = [
          `${9 + hourOffset}:00:00Z`, 
          `${12 + hourOffset}:30:00Z`, 
          `${16 + hourOffset}:15:00Z`, 
          `${19 + hourOffset}:45:00Z`
        ];

        for (const timeStr of slots) {
          // ensure the string has 2 digits for hours using padStart could be risky here with static sizes, 
          // but our hours range from 9 to 23 max which fit safely if formatted right.
          // Better logic:
          const [h, m, s] = timeStr.replace('Z','').split(':');
          const dateObj = new Date(baseDate + (h.length < 2 ? '0'+h : h) + ':' + m + ':' + s + 'Z');

          const seats = [];
          const _letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          for (let r = 0; r < screen.rows; r++) {
            let rowLetter = _letters[r % 26];
            for (let i = 1; i <= screen.seatsPerRow; i++) {
              seats.push({
                seatNo: `${rowLetter}${i}`,
                status: "available"
              });
            }
          }

          // Randomly book a few seats in some shows for realism
          if (Math.random() > 0.6) {
            const bookedCount = Math.floor(Math.random() * 20);
            for(let k=0; k<bookedCount; k++) {
                const randomIdx = Math.floor(Math.random() * seats.length);
                seats[randomIdx].status = "booked";
            }
          }

          await Show.create({
            movie: movie._id,
            screen: screen._id,
            showTime: dateObj,
            price: 250,
            seats
          });
        }
        console.log(`Created 4 slots for ${movie.title} at ${theater.name}`);
      }
    }

    console.log("Demo specific slots seeded successfully for all theaters!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createDemoData();
