"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = exports.approveUser = exports.getAllUsers = exports.promoteToAdmin = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const promoteToAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_schema_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.role = "admin";
        user.isVerified = true;
        await user.save();
        res.json({ message: `${user.email} promoted to admin` });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.promoteToAdmin = promoteToAdmin;
// Get all users
const getAllUsers = async (_req, res) => {
    try {
        const users = await user_schema_1.default.find().select("-password");
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.getAllUsers = getAllUsers;
// Approve a user (Farmer or Logistics)
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_schema_1.default.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.isVerified = true;
        await user.save();
        res.json({ message: "User approved", user });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.approveUser = approveUser;
// Reject / Block a user
const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_schema_1.default.findByIdAndDelete(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User blocked/removed successfully" });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.blockUser = blockUser;
