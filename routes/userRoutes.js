
import express from "express";
import passport from "passport";
import userAuth from "../middleware/userAuth.js";
import upload from "../config/multer.js";

import {
  loginUser,
  signupUser,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resendResetOtp,
  verifyResetOtp,
  resetPassword,
  updateProfile,
  sendEmailChangeOtp,
  verifyEmailChangeOtp,
  resendEmailChangeOtp,
  addAddress,
  editAddress,
  deleteAddress,
} from "../controllers/userController.js";

const router = express.Router();

// =====================================
// Public Authentication Routes
// =====================================

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.post("/verify-otp", verifyEmailOtp);
router.post("/resend-otp", resendEmailOtp);

// =====================================
// Forgot Password Routes
// =====================================

router.post("/forgot-password", forgotPassword);
router.post("/resend-reset-otp", resendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// =====================================
// Update Profile Route
// =====================================

router.post(
  "/update-profile",
  userAuth,
  upload.single("profilePhoto"),
  updateProfile
);

// =====================================
// Change Email Routes
// =====================================

router.post("/change-email", userAuth, sendEmailChangeOtp);
router.post("/verify-email-change-otp", userAuth, verifyEmailChangeOtp);
router.post("/resend-email-change-otp", userAuth, resendEmailChangeOtp);

// =====================================
// Google Login
// =====================================

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// =====================================
// Google Login Callback
// =====================================

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Create a new session for Google login
    req.session.regenerate((error) => {
      if (error) {
        console.error("Google session error:", error);

        return res.status(500).json({
          success: false,
          message: "Google login failed.",
        });
      }

      req.session.userId = req.user._id.toString();

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Google session save error:", saveError);

          return res.status(500).json({
            success: false,
            message: "Unable to save login session.",
          });
        }

        return res.redirect("/profile");
      });
    });
  }
);

// =====================================
// Address Management API
// =====================================

router.post("/add-address", userAuth, addAddress);
router.put("/edit-address/:addressId", userAuth, editAddress);
router.delete("/delete-address/:addressId", userAuth, deleteAddress);

// Check whether the user has an active session
router.get("/check-session", (req, res) => {
  res.set("Cache-Control", "no-store");

  res.json({
    loggedIn: Boolean(req.session?.userId),
  });
});
// =====================================
// Logout User
// =====================================

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: "Already logged out.",
    });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        success: false,
        message: "Logout failed.",
      });
    }

    res.clearCookie("myframe.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

export default router;
