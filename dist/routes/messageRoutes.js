"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Message_1 = require("../models/Message");
const Ticket_1 = require("../models/Ticket");
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const discord_bot_1 = require("../discord-bot");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logger"));
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post('/new-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { staffId, ticketId, body } = req.body;
    if (!staffId || !ticketId || !body) {
        res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
        return;
    }
    try {
        const staffCheckResponse = yield axios_1.default.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            staffId: staffId
        });
        if (staffCheckResponse.status !== 200) {
            res.status(403).json({ error: "Brrr! It looks like this staff member is not recognized in our winter wonderland." });
            return;
        }
        const staffData = staffCheckResponse.data;
        const discordId = staffData.discordId;
        const ticket = yield data_source_1.AppDataSource.getMongoRepository(Ticket_1.Ticket).findOne({
            where: { _id: new mongodb_1.ObjectId(ticketId) }
        });
        if (!ticket) {
            res.status(404).json({ error: "The ticket you're trying to message does not exist." });
            return;
        }
        const newMessage = new Message_1.Message();
        newMessage.author = staffId;
        newMessage.username = staffData.discordUsername;
        newMessage.message = body;
        newMessage.isStaff = true;
        newMessage.isAdmin = staffData.isAdmin;
        newMessage.date = new Date();
        newMessage.authorAvatar = staffData.discordAvatar;
        newMessage.createdAt = Date.now();
        newMessage.ticket = ticket;
        newMessage.staffRole = staffData.discordRole;
        yield data_source_1.AppDataSource.getMongoRepository(Message_1.Message).save(newMessage);
        ticket.messages.push(newMessage);
        yield data_source_1.AppDataSource.getMongoRepository(Ticket_1.Ticket).save(ticket);
        const channel = yield discord_bot_1.bot.channels.fetch(ticket.threadId);
        if (channel) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ name: staffData.discordUsername, iconURL: staffData.discordAvatar })
                .setDescription(body)
                .setTimestamp();
            yield channel.send({ embeds: [embed] });
        }
        res.status(200).json({ message: "Message sent successfully." });
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error sending message:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
}));
router.get('/messages/:ticketId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    try {
        const ticket = yield data_source_1.AppDataSource.getMongoRepository(Ticket_1.Ticket).findOne({
            where: { _id: new mongodb_1.ObjectId(ticketId) },
            relations: ["messages"]
        });
        if (!ticket) {
            res.status(404).json({ error: "The ticket you're trying to fetch messages for does not exist." });
            return;
        }
        res.json(ticket.messages);
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error fetching messages:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
}));
router.delete('/messages/:messageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    try {
        const message = yield data_source_1.AppDataSource.getMongoRepository(Message_1.Message).findOne({
            where: { _id: new mongodb_1.ObjectId(messageId) }
        });
        if (!message) {
            res.status(404).json({ error: "The message you're trying to delete does not exist." });
            return;
        }
        yield data_source_1.AppDataSource.getMongoRepository(Message_1.Message).remove(message);
        res.status(200).json({ message: "Message deleted successfully." });
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error deleting message:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
}));
exports.default = router;
