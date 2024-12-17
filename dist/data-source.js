"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Ticket_1 = require("./models/Ticket");
const Message_1 = require("./models/Message");
const Tag_1 = require("./models/Tag");
const Staff_1 = require("./models/Staff");
const Category_1 = require("./models/Category");
const Team_1 = require("./models/Team");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "./db.sqlite",
    synchronize: true,
    entities: [Ticket_1.Ticket, Message_1.Message, Tag_1.Tag, Staff_1.Staff, Category_1.Category, Team_1.Team],
});
