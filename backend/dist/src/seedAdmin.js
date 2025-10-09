"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_schema_1 = __importDefault(require("./models/user.schema"));
dotenv_1.default.config();
const seedAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL || "");
        const existingAdmin = await user_schema_1.default.findOne({ role: "admin" });
        if (existingAdmin) {
            console.log("Admin already exists:", existingAdmin.email);
            process.exit(0);
        }
        const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
        const admin = await user_schema_1.default.create({
            name: "Super Admin",
            email: "superadmin@example.com",
            password: hashedPassword,
            role: "admin",
            isVerified: true,
        });
        console.log("Admin created:", admin.email);
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedAdmin();
