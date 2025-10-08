import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/connectDB";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.routes";

const app = express();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3500;

// ✅ Allowed origins (local + production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://farmer-market.vercel.app", // your Vercel frontend URL
  "https://your-custom-domain.com" // optional custom domain
];

// ✅ CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes
app.get("/", (_req, res) => {
  res.send("🌾 Farmer Market Backend is running!");
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

// Start server (local only)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

//  Export for Vercel serverless handler
export default app;
