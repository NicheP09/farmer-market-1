import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  farmer: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  category: string;
  available: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    available: { type: Boolean, default: true, index: true }
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ name: "text" });

export default model<IProduct>("Product", productSchema);
