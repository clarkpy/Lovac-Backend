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
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.LOVAC_BACKEND_URL_PORT || 3000;
(0, logger_1.default)("=====================================================================", "log");
(0, logger_1.default)("Starting Lovac Backend...", "log");
app.use((0, cors_1.default)({
    origin: process.env.LOVAC_FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
(0, logger_1.default)("Registering authentication routes...", "log");
app.use(auth_1.default);
(0, logger_1.default)("Authentication routes registered.", "success");
(0, logger_1.default)("Registering API routes...", "log");
app.use("/", ticketRoutes_1.default);
app.use("/tags", tagRoutes_1.default);
app.use("/staff", staffRoutes_1.default);
app.use("/categories", categoryRoutes_1.default);
app.use("/api", closeTicketRoutes_1.default, messageRoutes_1.default, tagRoutes_1.default, teamRoutes_1.default);
(0, logger_1.default)("API routes registered.", "success");
(0, logger_1.default)("Connecting to the database...", "log");
data_source_1.AppDataSource.initialize()
    .then(() => {
    (0, logger_1.default)("Database connected.", "success");
    app.listen(PORT, () => {
        (0, logger_1.default)(`Server started on port ${PORT}.`, "success");
        (0, logger_1.default)("=====================================================================", "log");
    });
})
    .catch((err) => {
    (0, logger_1.default)("Database connection failed.", "error");
    console.error(err.stack);
});
