import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/connectDB";

import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();
connectDB();

// ✅ Allow frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://farmer-market-1-front.vercel.app",
  "https://farmer-market-1-front-easyjqdp0-peters-projects-122ba8b0.vercel.app",
];

// ✅ Fix CORS for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Always respond to preflight requests immediately
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes
app.get("/", (_req, res) => {
  res.send("🌾 Farmer Backend running with working CORS!");
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

// ✅ Local server only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () => console.log(`🚀 Local: http://localhost:${PORT}`));
}

// ✅ Required by Vercel
export const handler = serverless(app);
