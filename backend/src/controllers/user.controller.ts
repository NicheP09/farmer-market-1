import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User from "../models/user.schema";
import { sendEmail } from "../config/email";


const OTP_TTL_MS = 10 * 60 * 1000;

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


const jwtSecret: Secret = process.env.JWT_SECRET || "secret";
const jwtExpiry: string = process.env.JWT_EXPIRATION || "1d";

export const registerFarmer = async (req: Request, res: Response) => {
  try {

    const { firstName, lastName, phoneNumber, email, password, confirmPassword, agreeToTerms } = req.body;

    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!agreeToTerms) {
      return res.status(400).json({ message: "You must agree to the Terms of Use" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: "farmer",
      isVerified: true, 
    });

    return res.status(201).json({ message: "Farmer registered successfully" });
  } catch (err) {
    console.error("Register Farmer Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const registerBuyer = async (req: Request, res: Response) => {
  try {
    const { fullName, phoneNumber, email, password, confirmPassword, agreeToTerms } = req.body;

    if (!fullName || !phoneNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!agreeToTerms) {
      return res.status(400).json({ message: "You must agree to the Terms of Use" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: "buyer",
      isVerified: true, 
    });

    return res.status(201).json({ message: "Buyer registered successfully" });
  } catch (err) {
    console.error("Register Buyer Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const registerLogistics = async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber, email, password, confirmPassword, agreeToTerms } = req.body;

    if (!name || !phoneNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!agreeToTerms) {
      return res.status(400).json({ message: "You must agree to the Terms of Use" });
    }

    const existing = await User.findOne({ email }); 
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "logistics",
      isVerified: true, 
    });

    return res.status(201).json({ message: "Logistics registered successfully" });
  } catch (err) {
    console.error("Register Logistics Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password"); 
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiry } as SignOptions
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } }); 
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendEmail(email, "Your new OTP", `Your OTP is ${otp}. It expires in 10 minutes.`); 

    return res.json({ message: "New OTP sent" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } }).select("+password"); 
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
