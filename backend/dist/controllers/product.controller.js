"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const product_schema_1 = __importDefault(require("../models/product.schema"));
const mongoose_1 = require("mongoose");
async function createProduct(req, res) {
    const u = req.user;
    if (!u)
        return res.status(401).json({ message: "unauthorized" });
    if (u.role !== "farmer")
        return res.status(403).json({ message: "farmer only" });
    const { name, price, quantity, category, available } = req.body;
    if (!name || price === undefined || quantity === undefined || !category) {
        return res.status(400).json({ message: "name, price, quantity, category required" });
    }
    const farmerId = u._id || u.id; // handle both token shapes
    const doc = await product_schema_1.default.create({
        farmer: farmerId,
        name,
        price,
        quantity,
        category,
        available: available ?? true
    });
    return res.status(201).json(doc);
}
async function listProducts(req, res) {
    const { category, minPrice, maxPrice, farmer, available, q, page = "1", limit = "12", sort } = req.query;
    const filter = {};
    if (category)
        filter.category = category;
    if (farmer)
        filter.farmer = farmer;
    if (available === "true" || available === "false")
        filter.available = available === "true";
    const minP = minPrice ? Number(minPrice) : undefined;
    const maxP = maxPrice ? Number(maxPrice) : undefined;
    if (minP !== undefined || maxP !== undefined) {
        filter.price = {};
        if (minP !== undefined)
            filter.price.$gte = minP;
        if (maxP !== undefined)
            filter.price.$lte = maxP;
    }
    if (q)
        filter.$text = { $search: q };
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortMap = {
        price: { price: 1 },
        "-price": { price: -1 },
        createdAt: { createdAt: 1 },
        "-createdAt": { createdAt: -1 }
    };
    const sortBy = sortMap[sort || "-createdAt"] || { createdAt: -1 };
    const [data, total] = await Promise.all([
        product_schema_1.default.find(filter).sort(sortBy).skip(skip).limit(limitNum),
        product_schema_1.default.countDocuments(filter)
    ]);
    res.json({ data, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) });
}
async function getProduct(req, res) {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "bad id" });
    const prod = await product_schema_1.default.findById(id);
    if (!prod)
        return res.status(404).json({ message: "not found" });
    res.json(prod);
}
async function updateProduct(req, res) {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "bad id" });
    const prod = await product_schema_1.default.findById(id);
    if (!prod)
        return res.status(404).json({ message: "not found" });
    const u = req.user;
    if (!u)
        return res.status(401).json({ message: "unauthorized" });
    const isOwner = String(prod.farmer) === String(u._id || u.id);
    const isAdmin = u.role === "admin";
    if (!isOwner && !isAdmin)
        return res.status(403).json({ message: "not your product" });
    const { name, price, quantity, category, available } = req.body;
    if (name !== undefined)
        prod.name = name;
    if (price !== undefined)
        prod.price = price;
    if (quantity !== undefined)
        prod.quantity = quantity;
    if (category !== undefined)
        prod.category = category;
    if (available !== undefined)
        prod.available = available;
    await prod.save();
    res.json(prod);
}
async function deleteProduct(req, res) {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "bad id" });
    const prod = await product_schema_1.default.findById(id);
    if (!prod)
        return res.status(404).json({ message: "not found" });
    const u = req.user;
    if (!u)
        return res.status(401).json({ message: "unauthorized" });
    const isOwner = String(prod.farmer) === String(u._id || u.id);
    const isAdmin = u.role === "admin";
    if (!isOwner && !isAdmin)
        return res.status(403).json({ message: "not your product" });
    await prod.deleteOne();
    res.status(204).send();
}
