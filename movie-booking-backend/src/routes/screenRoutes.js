import express from "express";
import {
  getAllScreens,
  createScreen,
  deleteScreen,
} from "../controllers/screenController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllScreens); // Usually private to admin, but might be needed for dropdowns
router.post("/", protect, isAdmin, createScreen);
router.delete("/:id", protect, isAdmin, deleteScreen);

export default router;
