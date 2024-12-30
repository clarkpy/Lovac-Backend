"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const typeorm_1 = require("typeorm");
const Ticket_1 = require("./models/Ticket");
const Message_1 = require("./models/Message");
const Tag_1 = require("./models/Tag");
const Staff_1 = require("./models/Staff");
const Category_1 = require("./models/Category");
const Team_1 = require("./models/Team");
const User_1 = require("./models/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mongodb",
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    entities: [Ticket_1.Ticket, Message_1.Message, Tag_1.Tag, Staff_1.Staff, Category_1.Category, Team_1.Team, User_1.User],
});
