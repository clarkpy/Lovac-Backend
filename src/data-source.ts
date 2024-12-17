import { DataSource } from "typeorm";
import { Ticket } from "./models/Ticket";
import { Message } from "./models/Message";
import { Tag } from "./models/Tag";
import { Staff } from "./models/Staff";
import { Category } from "./models/Category";
import { Team } from "./models/Team";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "./db.sqlite",
    synchronize: true,
    entities: [Ticket, Message, Tag, Staff, Category, Team],
});