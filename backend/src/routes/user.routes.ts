import { Router } from "express";
import {
  registerFarmer,
  registerBuyer,
  registerLogistics,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

// Separate endpoints that match frontend buttons
router.post("/register/farmer", registerFarmer);
router.post("/register/buyer", registerBuyer);
router.post("/register/logistics", registerLogistics);

router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
