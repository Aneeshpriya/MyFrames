
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    // Prevent browser caching of protected pages
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Check whether user session exists
    const userId = req.session?.userId;

    if (!userId) {
      if (req.accepts("html")) {
        return res.redirect("/login");
      }

      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Find logged-in user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return req.session.destroy(() => {
        if (req.accepts("html")) {
          return res.redirect("/login");
        }

        return res.status(401).json({
          success: false,
          message: "User account not found. Please log in again.",
        });
      });
    }

    // Check whether user is blocked
    if (user.isBlocked) {
      return req.session.destroy(() => {
        if (req.accepts("html")) {
          return res.redirect("/login");
        }

        return res.status(403).json({
          success: false,
          message: "Your account has been blocked.",
        });
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("User authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default userAuth;
