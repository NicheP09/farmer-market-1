"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const user = req.user; // from authMiddleware
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
