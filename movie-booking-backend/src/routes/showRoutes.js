import express from "express";
import {
  getAllShows,
  createShow,
  getShow,
  lockSeats,
  confirmBooking,
  updateShow,
  deleteShow,
} from "../controllers/showController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllShows);
router.post("/", protect, isAdmin, createShow);
router.get("/:id", protect, getShow);
router.put("/:id", protect, isAdmin, updateShow);
router.delete("/:id", protect, isAdmin, deleteShow);
router.post("/:id/lock", protect, lockSeats);
router.post("/:id/confirm", protect, confirmBooking);

export default router;
