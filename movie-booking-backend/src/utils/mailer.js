import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not loaded in env");
    }

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    transporter.verify((err) => {
      if (err) {
        console.error("❌ Mail transporter error:", err.message);
      } else {
        console.log("✅ Mail transporter ready");
      }
    });
  }

  return transporter;
};

// ✅ Send OTP Email
export const sendOTPEmail = async (to, otp) => {
  try {
    if (!to) return;

    const tx = getTransporter();

    console.log("-----------------------------------------");
    console.log(`🔑 DEV OTP for ${to}: ${otp}`);
    console.log("-----------------------------------------");
    
    await tx.sendMail({
      from: `"Cinema Booking" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify Your Account</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
        </div>
      `,
    });

    console.log("📧 OTP email sent to:", to);
  } catch (err) {
    console.error("❌ OTP MAIL ERROR:", err.message);
  }
};

// ✅ Send Security/Auth Alert
export const sendAuthAlert = async (to, type, req) => {
  try {
    if (!to) return;

    const tx = getTransporter();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown IP";

    const device = req.headers["user-agent"] || "Unknown Device";

    await tx.sendMail({
      from: `"Cinema Booking Security" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Security Alert: ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Security Alert</h2>
          <p><b>Action:</b> ${type}</p>
          <p><b>IP Address:</b> ${ip}</p>
          <p><b>Device:</b> ${device}</p>
        </div>
      `,
    });

    console.log(`📧 Security email sent to ${to} [${type}]`);
  } catch (err) {
    console.error("❌ AUTH ALERT ERROR:", err.message);
  }
};
