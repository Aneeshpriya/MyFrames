
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import sendOtpEmail from "../utils/sendOtpEmail.js";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==========================================
// GET ALL USERS
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const skip = (page - 1) * limit;
    const safeSearch = escapeRegex(search);

    const searchQuery = {
      $or: [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ],
    };

    const users = await User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    const totalUsers = await User.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==========================================
// BLOCK USER
// ==========================================
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    console.error("Block user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to block user",
    });
  }
};

// ==========================================
// UNBLOCK USER
// ==========================================
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    console.error("Unblock user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unblock user",
    });
  }
};

// ==========================================
// DELETE USER
// ==========================================
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ==========================================
// LOGIN USER - SESSION AUTHENTICATION
// ==========================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please sign in using Google",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Regenerate session after successful login
    req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error);

        return res.status(500).json({
          success: false,
          message: "Unable to create login session.",
        });
      }

      // Store user ID in session
      req.session.userId = user._id.toString();

      // Save session before responding
      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);

          return res.status(500).json({
            success: false,
            message: "Unable to save login session.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      });
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ==========================================
// SIGNUP USER
// ==========================================
export const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = randomInt(100000, 1000000).toString();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      emailVerificationOtp: otp,
      emailVerificationExpires: new Date(Date.now() + 2 * 60 * 1000),
      isEmailVerified: false,
    });

    await sendOtpEmail(normalizedEmail, otp);

    return res.status(201).json({
      success: true,
      message: "Account created successfully. OTP sent to your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

// ==========================================
// VERIFY SIGNUP EMAIL OTP
// ==========================================
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+emailVerificationOtp +emailVerificationExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > user.emailVerificationExpires.getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.emailVerificationOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// ==========================================
// RESEND SIGNUP OTP
// ==========================================
export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+emailVerificationOtp +emailVerificationExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    user.emailVerificationOtp = otp;
    user.emailVerificationExpires = new Date(Date.now() + 2 * 60 * 1000);

    await user.save();
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend signup OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.password || user.authProvider === "google") {
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP will be sent to your email.",
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();
    await sendOtpEmail(user.email, otp, "reset");

    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP will be sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again.",
    });
  }
};

// ==========================================
// RESEND PASSWORD RESET OTP
// ==========================================
export const resendResetOtp = async (req, res) => {
  try {
    console.log("\n========== RESEND RESET OTP ==========");
    console.log("Request received");
    console.log("Email:", req.body.email);

    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password || user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "Password reset is not available for this account.",
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendOtpEmail(user.email, otp, "reset");

    console.log("OTP EMAIL SENT SUCCESSFULLY");
    console.log("====================================\n");

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.error("Resend password OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
    });
  }
};

// ==========================================
// VERIFY PASSWORD RESET OTP
// ==========================================
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password +passwordResetOtp +passwordResetOtpExpires");

    if (!user || !user.password || user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request.",
      });
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > user.passwordResetOtpExpires.getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.passwordResetOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const resetToken = jwt.sign(
      { id: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res
      .status(200)
      .cookie("passwordResetToken", resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 10 * 60 * 1000,
        path: "/",
      })
      .json({
        success: true,
        message: "OTP verified successfully.",
      });
  } catch (error) {
    console.error("Verify reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      newPassword.length < 6 ||
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Passwords must match and contain at least 6 characters.",
      });
    }

    const resetToken = req.cookies?.passwordResetToken;

    if (!resetToken) {
      return res.status(401).json({
        success: false,
        message: "Reset session expired. Please verify your OTP again.",
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset session.",
      });
    }

    const user = await User.findById(decoded.id).select("+password");

    if (!user || !user.password || user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "Unable to reset this account's password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;

    await user.save();

    return res
      .status(200)
      .clearCookie("passwordResetToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      .json({
        success: true,
        message: "Password reset successfully.",
      });
  } catch (error) {
    console.error("Reset password error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Reset session expired. Please verify your OTP again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Password reset failed.",
    });
  }
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    // Get logged-in user ID
    const userId = req.user._id;

    const { name, phone, dateOfBirth, gender } = req.body;

    // Validate name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    // Validate phone
    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    // Validate date of birth
    let parsedDateOfBirth = null;

    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);

      if (Number.isNaN(parsedDateOfBirth.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth.",
        });
      }

      if (parsedDateOfBirth > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Date of birth cannot be in the future.",
        });
      }
    }

    // Prepare profile data
    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      dateOfBirth: parsedDateOfBirth,
      gender: gender || null,
    };

    // Handle profile photo
    if (req.file) {
      updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    } else if (req.body.removeProfilePhoto === "true") {
      updateData.profilePhoto = null;
    }

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password");

    // Check user
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });

  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again.",
    });
  }
};



// ==========================================
// SEND OTP FOR CHANGING EMAIL
// ==========================================
export const sendEmailChangeOtp = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (typeof newEmail !== "string" || !newEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "New email address is required.",
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (normalizedEmail === user.email) {
      return res.status(400).json({
        success: false,
        message: "This is already your current email address.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    user.pendingEmail = normalizedEmail;
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    try {
      await sendOtpEmail(normalizedEmail, otp, "email-change");
    } catch (emailError) {
      user.pendingEmail = null;
      user.emailChangeOtp = null;
      user.emailChangeOtpExpires = null;

      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your new email address.",
    });
  } catch (error) {
    console.error("Send email change OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again.",
    });
  }
};

// ==========================================
// RESEND EMAIL CHANGE OTP
// ==========================================
export const resendEmailChangeOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+emailChangeOtp +emailChangeOtpExpires"
    );

    if (!user || !user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: "No pending email change request found.",
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    user.emailChangeOtp = otp;
    user.emailChangeOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    try {
      await sendOtpEmail(user.pendingEmail, otp, "email-change");
    } catch (emailError) {
      user.emailChangeOtp = null;
      user.emailChangeOtpExpires = null;

      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your new email address.",
    });
  } catch (error) {
    console.error("Resend email change OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP. Please try again.",
    });
  }
};

// ==========================================
// VERIFY EMAIL CHANGE OTP
// ==========================================
export const verifyEmailChangeOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+emailChangeOtp +emailChangeOtpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      !user.pendingEmail ||
      !user.emailChangeOtp ||
      !user.emailChangeOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "No email change request found. Please request a new OTP.",
      });
    }

    if (Date.now() > user.emailChangeOtpExpires.getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.emailChangeOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const existingUser = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Update email after successful OTP verification
    user.email = user.pendingEmail;
    user.isEmailVerified = true;

    // Clear email change data
    user.pendingEmail = null;
    user.emailChangeOtp = null;
    user.emailChangeOtpExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email address updated successfully.",
      email: user.email,
    });
  } catch (error) {
    console.error("Verify email change OTP error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Email verification failed. Please try again.",
    });
  }
};

// ==========================================
// ADD ADDRESS
// ==========================================

export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      houseName,
      street,
      landmark,
      pincode,
      city,
      state,
      country,
      addressType,
    } = req.body;

    // Validate required fields
    if (
      !fullName?.trim() ||
      !phoneNumber?.trim() ||
      !houseName?.trim() ||
      !street?.trim() ||
      !pincode?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !country?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields.",
      });
    }

    // Validate address type
    const validTypes = ["Home", "Work", "Other"];

    if (addressType && !validTypes.includes(addressType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type.",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Create address
    const newAddress = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      houseName: houseName.trim(),
      street: street.trim(),
      landmark: landmark?.trim() || "",
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      addressType: addressType || "Home",
    };

    // Add address to user's addresses array
    user.addresses.push(newAddress);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    console.error("Add address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add address.",
    });
  }
};
// ==========================================
// EDIT ADDRESS
// ==========================================

export const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const {
      fullName,
      phoneNumber,
      houseName,
      street,
      landmark,
      pincode,
      city,
      state,
      country,
      addressType,
    } = req.body;

    // Validate address ID
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    // Validate required fields
    if (
      !fullName?.trim() ||
      !phoneNumber?.trim() ||
      !houseName?.trim() ||
      !street?.trim() ||
      !pincode?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !country?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields.",
      });
    }

    // Validate address type
    const validTypes = ["Home", "Work", "Other"];

    if (addressType && !validTypes.includes(addressType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type.",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Find address using its ID
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    // Update address fields
    address.fullName = fullName.trim();
    address.phoneNumber = phoneNumber.trim();
    address.houseName = houseName.trim();
    address.street = street.trim();
    address.landmark = landmark?.trim() || "";
    address.pincode = pincode.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.country = country.trim();
    address.addressType = addressType || "Home";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address,
    });

  } catch (error) {
    console.error("Edit address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address.",
    });
  }
};

// ==========================================
// DELETE ADDRESS
// ==========================================

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Validate address ID
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Find address inside user's addresses array
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    // Remove selected address
    user.addresses.pull(addressId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });

  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address.",
    });
  }
};
