"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_adapter_1 = require("../middlewares/auth.adapter");
const r = (0, express_1.Router)();
r.get("/", product_controller_1.listProducts);
r.get("/:id", product_controller_1.getProduct);
// create, update, delete, farmers or admin only
r.post("/", auth_adapter_1.authMiddleware, (0, auth_adapter_1.authorizeRoles)("farmer", "admin"), product_controller_1.createProduct);
r.patch("/:id", auth_adapter_1.authMiddleware, (0, auth_adapter_1.authorizeRoles)("farmer", "admin"), product_controller_1.updateProduct);
r.delete("/:id", auth_adapter_1.authMiddleware, (0, auth_adapter_1.authorizeRoles)("farmer", "admin"), product_controller_1.deleteProduct);
exports.default = r;
