import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("User@123", 10);

    const user = new User({
      name: "Test User",
      email: "testuser@myframe.com",
      password: hashedPassword,
    });

    await user.save();

    console.log("Test user created successfully");
    console.log("User ID:", user._id);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating test user:", error.message);
    process.exit(1);
  }
};

createTestUser();