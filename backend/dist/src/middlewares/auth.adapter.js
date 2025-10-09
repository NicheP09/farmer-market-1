"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const USE_STUB = process.env.USE_AUTH_STUB === "true";
// Declare with safe defaults
let authMiddlewareReal;
let authorizeRolesReal;
// Load real middleware only if USE_STUB is false
if (!USE_STUB) {
    try {
        const mod = require("./auth.middleware");
        authMiddlewareReal = mod.authMiddleware;
        authorizeRolesReal = mod.authorizeRoles;
    }
    catch (err) {
        console.error("⚠️ Failed to load real auth middleware:", err);
    }
}
/** Stub auth middleware for local testing */
function authMiddlewareStub(req, res, next) {
    const raw = req.header("x-dev-user");
    if (!raw) {
        return res
            .status(401)
            .json({ message: "No x-dev-user header provided, or turn off USE_AUTH_STUB" });
    }
    try {
        req.user = JSON.parse(raw);
        next();
    }
    catch {
        return res.status(400).json({ message: "Invalid x-dev-user JSON" });
    }
}
/** Stub role authorizer for local testing */
function authorizeRolesStub(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        if (!roles.includes(user.role))
            return res.status(403).json({ message: "Forbidden" });
        next();
    };
}
// ✅ Fix: only export assigned functions safely
exports.authMiddleware = USE_STUB
    ? authMiddlewareStub
    : (authMiddlewareReal ?? authMiddlewareStub);
exports.authorizeRoles = USE_STUB
    ? authorizeRolesStub
    : (authorizeRolesReal ?? authorizeRolesStub);
