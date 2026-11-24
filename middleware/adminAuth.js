import mongoose from "mongoose";

const adminAuth = (req, res, next) => {
  try {

    // ==========================================
    // Check Admin Session
    // ==========================================

    if (
      !req.session ||
      !req.session.adminId
    ) {

      // API request
      if (req.originalUrl.startsWith("/api/")) {

        return res.status(401).json({
          success: false,
          message: "Admin login required",
        });

      }

      // Browser/EJS request
      return res.redirect("/admin/login");
    }


    // ==========================================
    // Check Admin Role
    // ==========================================

    if (
      req.session.adminRole !== "admin"
    ) {

      if (
        req.originalUrl.startsWith("/api/")
      ) {

        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });

      }

      return res.redirect("/admin/login");
    }


    // ==========================================
    // Validate Admin ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        req.session.adminId
      )
    ) {

      req.session.destroy(() => {});

      if (
        req.originalUrl.startsWith("/api/")
      ) {

        return res.status(403).json({
          success: false,
          message: "Invalid admin session",
        });

      }

      return res.redirect("/admin/login");
    }


    // ==========================================
    // Attach Admin ID
    // ==========================================

    req.adminId =
      req.session.adminId;


    next();

  } catch (error) {

    console.error(
      "Admin authentication error:",
      error
    );

    if (
      req.originalUrl.startsWith("/api/")
    ) {

      return res.status(500).json({
        success: false,
        message: "Authentication failed",
      });

    }

    return res.redirect("/admin/login");
  }
};

export default adminAuth;