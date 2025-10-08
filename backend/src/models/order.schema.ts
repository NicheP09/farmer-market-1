// src/models/Order.ts
import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
  buyer: Schema.Types.ObjectId;
  products: { product: Schema.Types.ObjectId; quantity: number }[];
  status: "pending" | "on-the-way" | "delivered";
  deliveryPartner?: Schema.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, enum: ["pending", "on-the-way", "delivered"], default: "pending" },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

export default model<IOrder>("Order", orderSchema);
