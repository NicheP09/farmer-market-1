// routes/admin.routes.ts
import { Router } from "express";
import { getAllUsers, approveUser, blockUser, promoteToAdmin } from "../controllers/admin.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

router.post("/promote-admin", authMiddleware, authorizeRoles("admin"), promoteToAdmin);

router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);

router.patch(
  "/approve/:id",
  authMiddleware,
  authorizeRoles("admin"),
  approveUser
);

router.delete(
  "/block/:id",
  authMiddleware,
  authorizeRoles("admin"),
  blockUser
);

export default router;
