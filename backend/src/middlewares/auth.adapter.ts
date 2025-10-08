import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

type Role = "farmer" | "buyer" | "logistics" | "admin";

declare global {
  namespace Express {
    interface UserPayload {
      id?: string;
      _id?: string;
      role: Role;
      isVerified?: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

const USE_STUB = process.env.USE_AUTH_STUB === "true";

// Declare with safe defaults
let authMiddlewareReal:
  | ((req: Request, res: Response, next: NextFunction) => void)
  | undefined;
let authorizeRolesReal:
  | ((...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void)
  | undefined;

// Load real middleware only if USE_STUB is false
if (!USE_STUB) {
  try {
    const mod = require("./auth.middleware");
    authMiddlewareReal = mod.authMiddleware;
    authorizeRolesReal = mod.authorizeRoles;
  } catch (err) {
    console.error("⚠️ Failed to load real auth middleware:", err);
  }
}

/** Stub auth middleware for local testing */
function authMiddlewareStub(req: Request, res: Response, next: NextFunction) {
  const raw = req.header("x-dev-user");
  if (!raw) {
    return res
      .status(401)
      .json({ message: "No x-dev-user header provided, or turn off USE_AUTH_STUB" });
  }

  try {
    req.user = JSON.parse(raw);
    next();
  } catch {
    return res.status(400).json({ message: "Invalid x-dev-user JSON" });
  }
}

/** Stub role authorizer for local testing */
function authorizeRolesStub(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// ✅ Fix: only export assigned functions safely
export const authMiddleware = USE_STUB
  ? authMiddlewareStub
  : (authMiddlewareReal ?? authMiddlewareStub);

export const authorizeRoles = USE_STUB
  ? authorizeRolesStub
  : (authorizeRolesReal ?? authorizeRolesStub);
