"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)();
const PORT = process.env.PORT || 3500;
// ✅ Allowed origins (local + production)
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://farmer-market.vercel.app", // your Vercel frontend URL
    "https://your-custom-domain.com" // optional custom domain
];
// ✅ CORS middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ✅ Routes
app.get("/", (_req, res) => {
    res.send("🌾 Farmer Market Backend is running!");
});
app.use("/api/users", user_routes_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/products", product_routes_1.default);
// Start server (local only)
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
//  Export for Vercel serverless handler
exports.default = app;
