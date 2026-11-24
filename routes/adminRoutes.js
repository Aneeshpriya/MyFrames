import express from "express";

import {
  adminLogin,
  adminLogout,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  updateUser,
} from "../controllers/adminController.js";

import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();


// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Admin Login
router.post(
  "/login",
  adminLogin
);


// Admin Logout
router.post(
  "/logout",
  adminAuth,
  adminLogout
);


// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users
router.get(
  "/users",
  adminAuth,
  getAllUsers
);


// Get single user
router.get(
  "/users/:userId",
  adminAuth,
  getUserById
);


// Update user
router.patch(
  "/users/:userId",
  adminAuth,
  updateUser
);


// Block user
router.patch(
  "/users/:userId/block",
  adminAuth,
  blockUser
);


// Unblock user
router.patch(
  "/users/:userId/unblock",
  adminAuth,
  unblockUser
);


// Delete user
router.delete(
  "/users/:userId",
  adminAuth,
  deleteUser
);


export default router;