"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const connectDB_1 = __importDefault(require("./config/connectDB"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, connectDB_1.default)();
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
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // ✅ Always respond to preflight requests immediately
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ✅ Routes
app.get("/", (_req, res) => {
    res.send("🌾 Farmer Backend running with working CORS!");
});
app.use("/api/users", user_routes_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/products", product_routes_1.default);
// ✅ Local server only
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3500;
    app.listen(PORT, () => console.log(`🚀 Local: http://localhost:${PORT}`));
}
// ✅ Required by Vercel
exports.handler = (0, serverless_http_1.default)(app);
