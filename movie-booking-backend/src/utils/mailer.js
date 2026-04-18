import nodemailer from "nodemailer";

let transporter = null;
let transporterVerified = false; // track verification state

const getTransporter = () => {
  // Already verified and working
  if (transporter && transporterVerified) return transporter;

  // Already tried and failed — don't retry
  if (transporterVerified === false && transporter === null) return null;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes("example.com")) {
    transporter = null;
    transporterVerified = false;
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify async — but we mark it failed if it errors
    transporter.verify((err) => {
      if (err) {
        transporter = null;
        transporterVerified = false;
      } else {
        transporterVerified = true;
        console.log("✅ Mail transporter ready");
      }
    });
  } catch (err) {
    transporter = null;
    transporterVerified = false;
    return null;
  }

  return transporter;
};

// ✅ Send OTP Email
export const sendOTPEmail = async (to, otp) => {
  try {
    if (!to) return;

    console.log("-----------------------------------------");
    console.log(`🔑 DEV OTP for ${to}: ${otp}`);
    console.log("-----------------------------------------");

    const tx = getTransporter();
    if (!tx) return;
    
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
    // Silently ignore — mark transporter as failed
    transporter = null;
    transporterVerified = false;
  }
};

// ✅ Send Security/Auth Alert (fire-and-forget, never blocks login)
export const sendAuthAlert = (to, type, req) => {
  try {
    if (!to) return;

    const tx = getTransporter();
    if (!tx) return;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown IP";

    const device = req.headers["user-agent"] || "Unknown Device";

    // Fire and forget — do NOT await
    tx.sendMail({
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
    }).catch(() => {
      // Silently ignore — disable transporter
      transporter = null;
      transporterVerified = false;
    });
  } catch (err) {
    // Silently ignore
  }
};
