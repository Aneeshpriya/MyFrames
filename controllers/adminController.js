import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// ==========================================
// Admin Login
// ==========================================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
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

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find admin
    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // Create Admin Session
    // ==========================================

    req.session.adminId = admin._id.toString();
    req.session.adminRole = "admin";

    // Save session before responding
    req.session.save((error) => {
      if (error) {
        console.error("Admin session save error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to create admin session",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
      });
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// Admin Logout
// ==========================================

export const adminLogout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Admin logout error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to logout",
      });
    }

    res.clearCookie("myframe.sid");

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  });
};

// ==========================================
// Get All Users
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -emailVerificationOtp -emailChangeOtp -passwordResetOtp"
    );

    return res.status(200).json({
      success: true,
      users,
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
// Get Single User
// ==========================================

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find user
    const user = await User.findById(userId).select(
      "-password -emailVerificationOtp -emailChangeOtp -passwordResetOtp"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ==========================================
// Block User
// ==========================================

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
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
// Unblock User
// ==========================================

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
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
// Delete User
// ==========================================

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
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
// Update User
// ==========================================

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      isBlocked,
    } = req.body;

    // Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether another user already uses this email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already belongs to another user",
      });
    }

    // Find current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // Update User Fields
    // ==========================================

    user.name = name.trim();

    user.email = normalizedEmail;

    user.phone =
      typeof phone === "string" && phone.trim()
        ? phone.trim()
        : null;

    user.dateOfBirth = dateOfBirth || null;

    user.gender =
      typeof gender === "string" && gender.trim()
        ? gender.trim()
        : null;

    // Account status
    if (typeof isBlocked === "boolean") {
      user.isBlocked = isBlocked;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export default adminLogin;