"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Order.ts
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    buyer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
        },
    ],
    status: { type: String, enum: ["pending", "on-the-way", "delivered"], default: "pending" },
    deliveryPartner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: false });
exports.default = (0, mongoose_1.model)("Order", orderSchema);
