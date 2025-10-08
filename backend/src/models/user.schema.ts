import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string; 
  password: string;
  role: "farmer" | "buyer" | "logistics" | "admin";
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true }, 
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["farmer", "buyer", "logistics", "admin"], default: "buyer" },
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IUser>("User", userSchema);
