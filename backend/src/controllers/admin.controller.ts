// controllers/admin.controller.ts
import { Request, Response } from "express";
import User from "../models/user.schema";

export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    user.isVerified = true;
    await user.save();

    res.json({ message: `${user.email} promoted to admin` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Approve a user (Farmer or Logistics)
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.json({ message: "User approved", user });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Reject / Block a user
export const blockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User blocked/removed successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
