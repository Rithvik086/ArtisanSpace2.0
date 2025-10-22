import {
  addUser,
  findUserByName,
  findUserByEmail,
  removeUser,
  updateUser,
} from "../services/userServices.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/emailSerice.js";
import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/userModel.js";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().optional(),
  mobile_no: z.string().optional(),
  address: z.string().optional(),
});

const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile_no: z.string().min(10, "Mobile number must be at least 10 digits"),
  role: z.enum(["admin", "manager", "artisan", "customer"]),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const signup = async (req: Request, res: Response) => {
  try {
    const validated = signupSchema.parse(req.body);
    const { username, name, email, password, mobile_no, role } = validated;

    const hashpass = await bcrypt.hash(password, 9);

    await addUser(username, name, email, hashpass, mobile_no, role);
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("User creation failed");
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await User.findByIdAndUpdate(user._id, {
      verificationToken: token,
      tokenExpiresAt: expiresAt,
    });
    const verificationLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/api/v1/verify-email?token=${token}`;
    try {
      await sendMail(
        email,
        "Verify Your Email - ArtisanSpace",
        `Dear ${name},\n\nThank you for registering with ArtisanSpace! Please verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not register, please ignore this email.\n\nBest regards,\nThe ArtisanSpace Team`
      );
    } catch (emailError) {
      // If email fails, remove the user
      await removeUser(user._id.toString());
      throw new Error("Failed to send verification email. Please try again.");
    }
    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.issues?.[0]?.message || "Validation error" });
    }
    throw new Error("Error signing up: " + (error as Error).message);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { username, password } = validated;

    const user = await findUserByName(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const ismatched = await bcrypt.compare(password, user.password);

    if (!ismatched) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, role: user.role, name: user.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.issues?.[0]?.message || "Validation error" });
    }
    throw new Error("Error logging in: " + (error as Error).message);
  }
};

const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const validated = verifyEmailSchema.parse(req.query);
    const { token } = validated;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification token has expired" });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationToken: null,
      tokenExpiresAt: null,
    });

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.issues?.[0]?.message || "Validation error" });
    }
    throw new Error("Error verifying email: " + (error as Error).message);
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const { email } = validated;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await User.findByIdAndUpdate(user._id, {
      resetToken: token,
      resetTokenExpiresAt: expiresAt,
    });

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/api/v1/reset-password?token=${token}`;
    await sendMail(
      email,
      "Reset Your Password - ArtisanSpace",
      `Dear ${user.name},\n\nYou requested a password reset for your ArtisanSpace account. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe ArtisanSpace Team`
    );

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.issues?.[0]?.message || "Validation error" });
    }
    throw new Error("Error in forgot password: " + (error as Error).message);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    const { token, newPassword } = validated;

    const user = await User.findOne({ resetToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashpass = await bcrypt.hash(newPassword, 9);
    await User.findByIdAndUpdate(user._id, {
      password: hashpass,
      resetToken: null,
      resetTokenExpiresAt: null,
    });

    res.status(200).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.issues?.[0]?.message || "Validation error" });
    }
    throw new Error("Error resetting password: " + (error as Error).message);
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    const result = await removeUser(req.user.id);

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (err) {
    throw new Error("Error deleting account: " + (err as Error).message);
  }
};

const updatProfile = async (req: Request, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const { name, mobile_no, address } = validated;

    const processedAddress = address ? address.toLowerCase() : address;
    const processedName = name ? name.toLowerCase() : name;
    const result = await updateUser(
      req.user.id,
      processedName,
      mobile_no,
      processedAddress
    );

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Validation error",
      });
    }
    throw new Error("Error updating profile: " + (error as Error).message);
  }
};

export {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updatProfile,
};
