"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.verifyEmail = exports.login = exports.registerLogistics = exports.registerBuyer = exports.registerFarmer = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../models/user.schema"));
const email_1 = require("../config/email");
const OTP_TTL_MS = 10 * 60 * 1000;
// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiry = process.env.JWT_EXPIRATION || "1d";
const registerFarmer = async (req, res) => {
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
        const existing = await user_schema_1.default.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await user_schema_1.default.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: "farmer",
            isVerified: true,
        });
        return res.status(201).json({ message: "Farmer registered successfully" });
    }
    catch (err) {
        console.error("Register Farmer Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerFarmer = registerFarmer;
const registerBuyer = async (req, res) => {
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
        const existing = await user_schema_1.default.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await user_schema_1.default.create({
            name: fullName,
            email,
            password: hashedPassword,
            role: "buyer",
            isVerified: true,
        });
        return res.status(201).json({ message: "Buyer registered successfully" });
    }
    catch (err) {
        console.error("Register Buyer Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerBuyer = registerBuyer;
const registerLogistics = async (req, res) => {
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
        const existing = await user_schema_1.default.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await user_schema_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: "logistics",
            isVerified: true,
        });
        return res.status(201).json({ message: "Logistics registered successfully" });
    }
    catch (err) {
        console.error("Register Logistics Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerLogistics = registerLogistics;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }
        const user = await user_schema_1.default.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiry });
        return res.json({
            message: "Login successful",
            token,
            role: user.role,
        });
    }
    catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP required" });
        }
        const user = await user_schema_1.default.findOne({ email, otp, otpExpires: { $gt: new Date() } });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.json({ message: "Email verified successfully" });
    }
    catch (err) {
        console.error("Verify Email Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyEmail = verifyEmail;
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }
        const user = await user_schema_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
        await user.save();
        await (0, email_1.sendEmail)(email, "Your new OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);
        return res.json({ message: "New OTP sent" });
    }
    catch (err) {
        console.error("Resend OTP Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resendOtp = resendOtp;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }
        const user = await user_schema_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
        await user.save();
        await (0, email_1.sendEmail)(email, "Password Reset OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);
        return res.json({ message: "OTP sent to email" });
    }
    catch (err) {
        console.error("Forgot Password Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = await user_schema_1.default.findOne({ email, otp, otpExpires: { $gt: new Date() } }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.json({ message: "Password reset successful" });
    }
    catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
