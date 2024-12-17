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
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.LOVAC_BACKEND_URL_PORT || 3000;

app.use(cors({
    origin: process.env.LOVAC_FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());

console.log("Initializing authentication routes...");
app.use(auth);
console.log("Authentication routes registered.");

console.log("Registering API routes...");
app.use("/tickets", ticketRoutes);
app.use("/tags", tagRoutes);
app.use("/staff", staffRoutes);
app.use("/categories", categoryRoutes);
app.use("/api", closeTicketRoutes, messageRoutes, tagRoutes, teamRoutes);
console.log("API routes registered.");

console.log("Initializing database connection...");
AppDataSource.initialize()
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