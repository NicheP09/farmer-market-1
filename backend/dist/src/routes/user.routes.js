"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Separate endpoints that match frontend buttons
router.post("/register/farmer", user_controller_1.registerFarmer);
router.post("/register/buyer", user_controller_1.registerBuyer);
router.post("/register/logistics", user_controller_1.registerLogistics);
router.post("/login", user_controller_1.login);
router.post("/verify-email", user_controller_1.verifyEmail);
router.post("/resend-otp", user_controller_1.resendOtp);
router.post("/forgot-password", user_controller_1.forgotPassword);
router.post("/reset-password", user_controller_1.resetPassword);
exports.default = router;
