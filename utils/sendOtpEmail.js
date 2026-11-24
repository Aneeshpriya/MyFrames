
import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Gmail connection failed:", error);
  } else {
    console.log("Gmail SMTP connection successful");
  }
});

const sendOtpEmail = async (email, otp, purpose = "signup") => {
  let subject;
  let message;

  if (purpose === "reset") {
    subject = "MyFrames Password Reset OTP";
    message = `Your MyFrames password reset OTP is ${otp}. This OTP is valid for 5 minutes.`;
  } else if (purpose === "email-change") {
    subject = "MyFrames Email Change OTP";
    message = `Your MyFrames email change OTP is ${otp}. This OTP is valid for 5 minutes.`;
  } else {
    subject = "MyFrames Email Verification OTP";
    message = `Your MyFrames email verification OTP is ${otp}. This OTP is valid for 2 minutes.`;
  }

  const mailOptions = {
    from: `"MyFrames" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
