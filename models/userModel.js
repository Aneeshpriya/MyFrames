
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      default: null,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Signup Email Verification OTP
    emailVerificationOtp: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Email Change OTP
    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    emailChangeOtp: {
      type: String,
      default: null,
      select: false,
    },

    emailChangeOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Forgot Password OTP
    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Address Management
    addresses: [
      {
        fullName: {
          type: String,
          required: true,
          trim: true,
        },

        phoneNumber: {
          type: String,
          required: true,
          trim: true,
        },

        houseName: {
          type: String,
          required: true,
          trim: true,
        },

        street: {
          type: String,
          required: true,
          trim: true,
        },

        landmark: {
          type: String,
          default: "",
          trim: true,
        },

        pincode: {
          type: String,
          required: true,
          trim: true,
        },

        city: {
          type: String,
          required: true,
          trim: true,
        },

        state: {
          type: String,
          required: true,
          trim: true,
        },

        country: {
          type: String,
          required: true,
          trim: true,
        },

        addressType: {
          type: String,
          enum: ["Home", "Work", "Other"],
          default: "Home",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
