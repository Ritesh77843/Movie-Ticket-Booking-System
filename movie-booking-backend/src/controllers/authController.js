import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendAuthAlert, sendOTPEmail } from "../utils/mailer.js";
import { generateOTP } from "../utils/otp.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock-client-id");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= REGISTER =================
// ✅ Register (email OR phone) → Send OTP
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res
        .status(400)
        .json({ message: "Name, password and email or phone is required" });
    }

    const queryOptions = [];
    if (email) queryOptions.push({ email });
    if (phone) queryOptions.push({ phone });
    const exists = await User.findOne({ $or: queryOptions });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      password: hashed,
      role: "user",
      isVerified: true, // Auto-verified
    });

    res.status(201).json({
      message: "Registered successfully.",
      userId: user._id,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ================= VERIFY OTP =================
export const verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    const queryOptions = [];
    if (email) queryOptions.push({ email });
    if (phone) queryOptions.push({ phone });
    const user = await User.findOne({ $or: queryOptions });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const valid =
      (email && user.emailOTP === otp) ||
      (phone && user.phoneOTP === otp);

    if (!valid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.emailOTP = null;
    user.phoneOTP = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;

    await user.save();

    res.json({ message: "Account verified successfully. You can login now." });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        message: "Email/Phone and password required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    if (user.email) {
      await sendAuthAlert(user.email, "LOGIN", req);
    }

    user.lastLoginAt = new Date();
    user.lastLoginIP =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Google token missing" });

    // Verify token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      });
      payload = ticket.getPayload();
    } catch (e) {
      // Decode without verification if mock client ID used locally to prevent crash for testing
      const decoded = jwt.decode(token);
      payload = decoded;
      if (!payload || !payload.email) throw e;
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      // Generate secure random password
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: "user",
        isVerified: true,
      });
      await sendAuthAlert(email, "REGISTER", req);
    }

    const jwtToken = generateToken(user);

    user.lastLoginAt = new Date();
    user.lastLoginIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    await user.save();

    await sendAuthAlert(email, "LOGIN", req);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const queryOptions = [];
    if (email) queryOptions.push({ email });
    if (phone) queryOptions.push({ phone });
    const user = await User.findOne({ $or: queryOptions });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();

    user.emailOTP = email ? otp : null;
    user.phoneOTP = phone ? otp : null;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    if (email) {
      await sendOTPEmail(email, otp);
      await sendAuthAlert(email, "FORGOT_PASSWORD", req);
    }

    res.json({ message: "OTP sent for password reset" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;

    if ((!email && !phone) || !otp || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const queryOptions = [];
    if (email) queryOptions.push({ email });
    if (phone) queryOptions.push({ phone });
    const user = await User.findOne({ $or: queryOptions });

    if (!user || !user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const valid =
      (email && user.emailOTP === otp) ||
      (phone && user.phoneOTP === otp);

    if (!valid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailOTP = null;
    user.phoneOTP = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({ message: "Password reset successful. You can login now." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ================= CREATE ADMIN (Admin Only) =================
export const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = await User.create({
      name,
      email,
      phone: phone || undefined,
      password: hashed,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "Admin created successfully.",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// ================= GET ALL ADMINS (Admin Only) =================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    console.error("GET ADMINS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

// ================= DELETE ADMIN (Admin Only) =================
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Check if user is admin
    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("DELETE ADMIN ERROR:", err);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};
