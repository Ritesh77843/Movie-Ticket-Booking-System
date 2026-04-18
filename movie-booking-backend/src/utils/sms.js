// utils/sms.js
import twilio from "twilio";

let client = null;

const getClient = () => {
  if (client) return client;

  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE) {
    return null;
  }

  try {
    client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    return client;
  } catch (err) {
    return null;
  }
};

export const sendSMS = async (to, message) => {
  try {
    const tw = getClient();
    if (!tw) {
      console.log(`📱 SMS (dev mode) to ${to}: ${message}`);
      return;
    }

    await tw.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log(`📱 SMS sent to ${to}`);
  } catch (err) {
    console.log(`📱 SMS to ${to} failed (non-blocking): ${err.message}`);
    // Never crash — just log and continue
  }
};
