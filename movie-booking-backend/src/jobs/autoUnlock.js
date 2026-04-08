import cron from "node-cron";
import Show from "../models/Show.js";

const LOCK_TIMEOUT_MINUTES = 2;

export const startAutoUnlockJob = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      const expiry = new Date(Date.now() - LOCK_TIMEOUT_MINUTES * 60 * 1000);

      // Find shows that have at least one expired locked seat
      const affectedShows = await Show.find(
        {
          "seats.status": "locked",
          "seats.lockedAt": { $lt: expiry },
        },
        { _id: 1 }
      );

      if (affectedShows.length === 0) return;

      const showIds = affectedShows.map((s) => s._id.toString());

      // Unlock seats in all affected shows
      const result = await Show.updateMany(
        {
          _id: { $in: showIds },
          "seats.status": "locked",
          "seats.lockedAt": { $lt: expiry },
        },
        {
          $set: {
            "seats.$[elem].status": "available",
            "seats.$[elem].lockedBy": null,
            "seats.$[elem].lockedAt": null,
          },
        },
        {
          arrayFilters: [
            {
              "elem.status": "locked",
              "elem.lockedAt": { $lt: expiry },
            },
          ],
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`⏱️ Auto-unlocked ${result.modifiedCount} expired seat locks in ${showIds.length} shows`);
        
        // Notify all clients in the affected show rooms to refresh
        showIds.forEach(id => {
          io.to(id).emit("seats-updated", { showId: id });
        });
      }
    } catch (err) {
      console.error("❌ Auto-unlock job failed:", err.message);
    }
  });
};
