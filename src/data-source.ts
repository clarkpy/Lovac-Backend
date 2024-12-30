import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import { Ticket } from "./models/Ticket";
import { Message } from "./models/Message";
import { Tag } from "./models/Tag";
import { Staff } from "./models/Staff";
import { Category } from "./models/Category";
import { Team } from "./models/Team";
import { User } from "./models/User";

export const AppDataSource = new DataSource({
    type: "mongodb",
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    entities: [Ticket, Message, Tag, Staff, Category, Team, User],
});