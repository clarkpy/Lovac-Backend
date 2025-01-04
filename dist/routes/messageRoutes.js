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
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post('/new-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
            where: { id: Number(ticketId) },
        });
        if (!ticket) {
            res.status(404).json({ error: 'Paws and whiskers! This ticket seems to have vanished into the landscape!' });
            return;
        }
        const message = new Message_1.Message();
        message.author = staffData.discordId;
        message.username = staffData.discordDisplayName;
        message.message = body;
        message.isStaff = true;
        message.isAdmin = false;
        message.date = new Date();
        message.authorAvatar = staffData.discordAvatar;
        message.createdAt = Date.now();
        message.ticket = ticket;
        message.staffRole = staffData.discordRole;
        yield data_source_1.AppDataSource.manager.save(message);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('New Message')
            .setDescription(body)
            .setAuthor({ name: staffData.discordDisplayName, iconURL: staffData.discordAvatar })
            .setFooter({ text: 'Lovac', iconURL: (_a = discord_bot_1.bot.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() })
            .setTimestamp();
        const threadId = ticket.threadId;
        if (!threadId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }
        const channel = yield discord_bot_1.bot.channels.fetch(threadId);
        if (channel && channel.isTextBased()) {
            yield channel.send({ embeds: [embed] });
        }
        res.status(201).json({ successMessage: 'Message created successfully.', createdMessage: message });
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error creating message:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a little chaos in our cozy corner!" });
    }
}));
router.post('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }
        (0, logger_1.default)('Fetching messages for ticket ID:', ticketId);
        const dbMessages = yield data_source_1.AppDataSource.manager.find(Message_1.Message, {
            where: { ticket: { id: Number(ticketId) } },
            order: { date: 'ASC' }
        });
        (0, logger_1.default)(`Database messages fetched: ${dbMessages.length}`, "warning");
        dbMessages.forEach((msg, index) => {
            (0, logger_1.default)(`Message ${index + 1}: ${JSON.stringify(msg)}`, "warning");
        });
        const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, { where: { id: Number(ticketId) } });
        if (!ticket || !ticket.threadId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }
        try {
            const channel = yield discord_bot_1.bot.channels.fetch(ticket.threadId);
            let discordMessages = [];
            if (channel && channel.isTextBased()) {
                const messages = yield channel.messages.fetch({ limit: 100 });
                discordMessages = yield Promise.all(messages.filter(msg => !msg.author.bot).map((msg) => __awaiter(void 0, void 0, void 0, function* () {
                    const member = msg.member;
                    const isStaff = (member === null || member === void 0 ? void 0 : member.roles.cache.some((role) => role.name === "Ticket Staff")) || false;
                    const isAdmin = (member === null || member === void 0 ? void 0 : member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) || false;
                    return {
                        id: msg.id,
                        author: msg.author.id,
                        username: msg.author.username,
                        message: msg.content,
                        isStaff,
                        isAdmin,
                        date: msg.createdAt,
                        authorAvatar: msg.author.displayAvatarURL(),
                        createdAt: msg.createdTimestamp,
                        staffRole: ""
                    };
                })));
            }
            const allMessages = [...dbMessages, ...discordMessages].sort((a, b) => a.createdAt - b.createdAt);
            res.status(200).json(allMessages);
        }
        catch (discordError) {
            (0, logger_1.default)(`Discord error: ${discordError}`, "error");
            res.status(200).json(dbMessages);
        }
    }
    catch (error) {
        (0, logger_1.default)(`Error fetching messages: ${error}`, "error");
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a little chaos in our cozy corner!" });
    }
}));
exports.default = router;
