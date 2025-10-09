"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const connectDB_1 = __importDefault(require("../config/connectDB"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
(0, connectDB_1.default)();
app.get("/", (req, res) => {
    res.send("🚀 Agrolink Backend running on Vercel");
});
app.use("/api/users", user_routes_1.default);
exports.handler = (0, serverless_http_1.default)(app);
