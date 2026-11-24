import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";

import "./config/passport.js";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userAuth from "./middleware/userAuth.js";
import User from "./models/userModel.js";

const app = express();

// ==========================================
// EJS Configuration
// ==========================================

app.set("view engine", "ejs");
app.set("views", "./views");

// ==========================================
// Basic Middleware
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// Express Session
// ==========================================

app.use(
  session({
    name: "myframe.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      clientPromise: mongoose.connection
        .asPromise()
        .then((connection) => connection.getClient()),

      collectionName: "sessions",

      ttl: 24 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ==========================================
// Static Files
// ==========================================

app.use(express.static("public"));

// ==========================================
// Passport
// ==========================================

app.use(passport.initialize());

// ==========================================
// API Routes
// ==========================================

app.use("/api/admin", adminRoutes);

app.use("/api/users", userRoutes);

// ==========================================
// Common Middleware
// ==========================================

// Prevent browser caching on protected pages
const preventCache = (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );

  res.set("Pragma", "no-cache");

  res.set("Expires", "0");

  next();
};

// ==========================================
// Redirect Already Logged-in User
// ==========================================

const redirectLoggedInUser = (req, res, next) => {
  if (req.session?.userId) {
    return res.redirect("/profile");
  }

  next();
};

// ==========================================
// Admin Page Authentication
// ==========================================

const adminPageAuth = (req, res, next) => {
  if (
    !req.session?.adminId ||
    req.session.adminRole !== "admin"
  ) {
    return res.redirect("/admin/login");
  }

  next();
};



// ------------------------------------------
// Admin Login
// ------------------------------------------

app.get("/admin/login", preventCache, (req, res) => {
  if (
    req.session?.adminId &&
    req.session?.adminRole === "admin"
  ) {
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/login");
});

// ------------------------------------------
// Admin Dashboard
// ------------------------------------------

app.get(
  "/admin/dashboard",
  preventCache,
  adminPageAuth,
  (req, res) => {
    res.render("admin/dashboard");
  }
);

// ------------------------------------------
// User Management
// ------------------------------------------

app.get(
  "/admin/users",
  preventCache,
  adminPageAuth,
  (req, res) => {
    res.render("admin/userManagement");
  }
);

// ------------------------------------------
// User Information
// ------------------------------------------

app.get(
  "/admin/users/:id",
  preventCache,
  adminPageAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/admin/users");
      }

      const user = await User.findById(id).select(
        "-password -emailVerificationOtp -emailChangeOtp -passwordResetOtp"
      );

      if (!user) {
        return res.redirect("/admin/users");
      }

      res.render("admin/userInformation", {
        user,
      });
    } catch (error) {
      console.error(
        "User information page error:",
        error
      );

      return res.redirect("/admin/users");
    }
  }
);

// ------------------------------------------
// Edit User
// ------------------------------------------

app.get(
  "/admin/users/:id/edit",
  preventCache,
  adminPageAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/admin/users");
      }

      const user = await User.findById(id).select(
        "-password -emailVerificationOtp -emailChangeOtp -passwordResetOtp"
      );

      if (!user) {
        return res.redirect("/admin/users");
      }

      res.render("admin/editUser", {
        user,
      });
    } catch (error) {
      console.error(
        "Edit user page error:",
        error
      );

      return res.redirect("/admin/users");
    }
  }
);

// ------------------------------------------
// Block User Page
// ------------------------------------------

app.get(
  "/admin/users/:id/block",
  preventCache,
  adminPageAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.redirect("/admin/users");
      }

      const user = await User.findById(id).select(
        "-password -emailVerificationOtp -emailChangeOtp -passwordResetOtp"
      );

      if (!user) {
        return res.redirect("/admin/users");
      }

      res.render("admin/blockUser", {
        user,
      });
    } catch (error) {
      console.error(
        "Block user page error:",
        error
      );

      return res.redirect("/admin/users");
    }
  }
);

// ==========================================
// PUBLIC USER PAGES
// ==========================================

// ------------------------------------------
// Home
// ------------------------------------------

app.get("/", (req, res) => {
  res.render("index");
});

// ------------------------------------------
// Login
// ------------------------------------------

app.get(
  "/login",
  redirectLoggedInUser,
  (req, res) => {
    res.render("login");
  }
);

// ------------------------------------------
// Signup
// ------------------------------------------

app.get(
  "/signup",
  redirectLoggedInUser,
  (req, res) => {
    res.render("signup");
  }
);

// ------------------------------------------
// OTP Verification
// ------------------------------------------

app.get("/otpverification", (req, res) => {
  res.render("otpverification");
});

// ------------------------------------------
// Forgot Password
// ------------------------------------------

app.get("/forgot-password", (req, res) => {
  res.render("forgotpassword");
});

// ------------------------------------------
// Reset Password
// ------------------------------------------

app.get("/reset-password", (req, res) => {
  res.render("resetpassword");
});

// ==========================================
// PROTECTED USER PAGES
// ==========================================

// ------------------------------------------
// Profile
// ------------------------------------------

app.get(
  "/profile",
  preventCache,
  userAuth,
  (req, res) => {
    res.render("profile", {
      user: req.user,
    });
  }
);

// ------------------------------------------
// Personal Information
// ------------------------------------------

app.get(
  "/personal-info",
  preventCache,
  userAuth,
  (req, res) => {
    res.render("personalinfo", {
      user: req.user,
    });
  }
);

// ------------------------------------------
// Edit Profile
// ------------------------------------------

app.get(
  "/edit-profile",
  preventCache,
  userAuth,
  (req, res) => {
    res.render("editprofile", {
      user: req.user,
    });
  }
);

// ------------------------------------------
// Addresses
// ------------------------------------------

app.get(
  "/addresses",
  preventCache,
  userAuth,
  (req, res) => {
    res.render("addresses", {
      user: req.user,
    });
  }
);

// ------------------------------------------
// Add Address
// ------------------------------------------

app.get(
  "/add-address",
  preventCache,
  userAuth,
  (req, res) => {
    res.render("addaddress", {
      user: req.user,
    });
  }
);

// ------------------------------------------
// Edit Address
// ------------------------------------------

app.get(
  "/edit-address/:addressId",
  preventCache,
  userAuth,
  (req, res) => {
    const address = req.user.addresses.id(
      req.params.addressId
    );

    if (!address) {
      return res.redirect("/addresses");
    }

    res.render("editaddress", {
      user: req.user,
      address,
    });
  }
);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Check session secret first
    if (!process.env.SESSION_SECRET) {
      throw new Error(
        "SESSION_SECRET is missing from .env"
      );
    }

    // Connect MongoDB
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();