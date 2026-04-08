import express from "express";
import {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/authController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Auth Routes
router.post("/register", register);          // Register user (email/phone) + send OTP
router.post("/verify", verifyOTP);           // Verify OTP (email/phone)
router.post("/login", login);                // Login with email OR phone (only verified users)
router.post("/google", googleLogin);         // Login with Google OR register if missing
router.post("/forgot-password", forgotPassword); // Send OTP for password reset
router.post("/reset-password", resetPassword);   // Reset password using OTP

// 🛡️ Admin Management Routes (Protected - Admin Only)
router.post("/admins", protect, isAdmin, createAdmin);     // Create new admin
router.get("/admins", protect, isAdmin, getAllAdmins);     // Get all admins
router.delete("/admins/:id", protect, isAdmin, deleteAdmin); // Delete admin

export default router;
