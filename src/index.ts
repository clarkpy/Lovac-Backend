import express from "express";
import { AppDataSource } from "./data-source";
import { bot } from "./discord-bot";
import cors from "cors";
import ticketRoutes from "./routes/ticketRoutes";
import tagRoutes from "./routes/tagRoutes";
import staffRoutes from "./routes/staffRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import messageRoutes from "./routes/messageRoutes";
import teamRoutes from "./routes/teamRoutes";
import auth from "./auth";
import closeTicketRoutes from "./routes/closeTicketRoutes";
import route from "./routes/route";
import dotenv from "dotenv";
import log from "./logger";

dotenv.config();

const app = express();
const PORT = process.env.LOVAC_BACKEND_URL_PORT || 3000;

log("=====================================================================", "log");
log("Starting Lovac Backend...", "log");

app.use(cors({
    origin: process.env.LOVAC_FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());

log("Registering authentication routes...", "log");
app.use(auth);
log("Authentication routes registered.", "success");

log("Registering API routes...", "log");
app.use("/", ticketRoutes, route);
app.use("/tags", tagRoutes);
app.use("/staff", staffRoutes);
app.use("/categories", categoryRoutes);
app.use("/api", closeTicketRoutes, messageRoutes, tagRoutes, teamRoutes);
log("API routes registered.", "success");

log("Connecting to the database...", "log");
AppDataSource.initialize()
    .then(() => {
        log("Database connected.", "success");
        app.listen(PORT, () => {
            log(`Server started on port ${PORT}.`, "success");
            log("=====================================================================", "log");
        });
    })
    .catch((err) => {
        log("Database connection failed.", "error");
        console.error(err.stack);
    });