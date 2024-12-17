"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const cors_1 = __importDefault(require("cors"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const auth_1 = __importDefault(require("./auth"));
const closeTicketRoutes_1 = __importDefault(require("./routes/closeTicketRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.LOVAC_BACKEND_URL_PORT || 3000;
app.use((0, cors_1.default)({
    origin: process.env.LOVAC_FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
console.log("Initializing authentication routes...");
app.use(auth_1.default);
console.log("Authentication routes registered.");
console.log("Registering API routes...");
app.use("/tickets", ticketRoutes_1.default);
app.use("/tags", tagRoutes_1.default);
app.use("/staff", staffRoutes_1.default);
app.use("/categories", categoryRoutes_1.default);
app.use("/api", closeTicketRoutes_1.default, messageRoutes_1.default, tagRoutes_1.default, teamRoutes_1.default);
console.log("API routes registered.");
console.log("Initializing database connection...");
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
        console.log(`Server running on ${process.env.LOVAC_BACKEND_URL_SHORT}:${PORT}`);
    });
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
    console.error(err.stack);
});
