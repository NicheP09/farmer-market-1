import { Router } from "express";
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.adapter";

const r = Router();

r.get("/", listProducts);
r.get("/:id", getProduct);

// create, update, delete, farmers or admin only
r.post("/", authMiddleware, authorizeRoles("farmer", "admin"), createProduct);
r.patch("/:id", authMiddleware, authorizeRoles("farmer", "admin"), updateProduct);
r.delete("/:id", authMiddleware, authorizeRoles("farmer", "admin"), deleteProduct);

export default r;
