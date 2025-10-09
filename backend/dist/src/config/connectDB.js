"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false; // Track the connection state globally
const connectDB = async () => {
    if (isConnected) {
        // If already connected, skip re-connecting
        console.log("✅ Using existing MongoDB connection");
        return;
    }
    try {
        const db = await mongoose_1.default.connect(process.env.MONGO_URL);
        isConnected = db.connection.readyState === 1; // 1 = connected
        console.log("🚀 MongoDB connected");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("❌ MongoDB connection failed:", error.message);
        }
        else {
            console.error("❌ MongoDB connection failed:", error);
        }
        throw error; // Pass the error up to the route handler
    }
};
exports.default = connectDB;
