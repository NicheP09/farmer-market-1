"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/admin.routes.ts
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/promote-admin", auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)("admin"), admin_controller_1.promoteToAdmin);
router.get("/users", auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)("admin"), admin_controller_1.getAllUsers);
router.patch("/approve/:id", auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)("admin"), admin_controller_1.approveUser);
router.delete("/block/:id", auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)("admin"), admin_controller_1.blockUser);
exports.default = router;
