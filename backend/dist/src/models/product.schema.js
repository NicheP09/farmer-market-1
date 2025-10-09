"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    farmer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    available: { type: Boolean, default: true, index: true }
}, { timestamps: true, versionKey: false });
productSchema.index({ name: "text" });
exports.default = (0, mongoose_1.model)("Product", productSchema);
