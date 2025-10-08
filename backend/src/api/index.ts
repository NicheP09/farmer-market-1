import express, { Request, Response } from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import connectDB from "../config/connectDB";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Agrolink Backend running on Vercel");
});

app.use("/api/users", userRoutes);

export const handler = serverless(app);
