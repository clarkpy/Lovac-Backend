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
const Ticket_1 = require("../models/Ticket");
const discord_js_1 = require("discord.js");
const discord_bot_1 = require("../discord-bot");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post("/close-ticket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId, staffUsername, ticketId } = req.body;
        if (!staffId || !staffUsername || !ticketId) {
            res.status(400).json({ error: "Meow, it looks like some details are missing from your request!" });
            return;
        }
        const staffCheckResponse = yield axios_1.default.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            staffId: staffId,
            discordUsername: staffUsername
        });
        if (staffCheckResponse.status !== 200) {
            res.status(403).json({ error: "Brrr! It seems like this staff member is not purr-fectly recognized in our winter wonderland." });
            return;
        }
        const staffData = staffCheckResponse.data;
        if (!staffData) {
            res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
            return;
        }
        const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
            where: { id: Number(ticketId) },
        });
        if (!ticket) {
            res.status(404).json({ error: "Purr-haps this ticket has been swept away by the snowy winds?" });
            return;
        }
        if (!ticket.threadId) {
            res.status(400).json({ error: "Meow, it looks like some details are missing from your request!" });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(":question: Can this ticket be closed?")
            .setDescription(`Hey <@${ticket.ownerId}>,\n\n<@${staffData.discordId}> wants to close this ticket.\nClick 'Accept & Close' to close the ticket or 'Keep Open' to keep it open.\n\n**This action is irreversible and all messages will be transcripted.**`)
            .setAuthor({ name: `${staffData.discordDisplayName}`, iconURL: `${staffData.discordAvatar}` })
            .setColor(0xff0000);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`acceptClose_${ticketId}`).setLabel("Accept & Close").setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(`denyClose_${ticketId}`).setLabel("Keep Open").setStyle(discord_js_1.ButtonStyle.Danger));
        const channel = yield discord_bot_1.bot.channels.fetch(ticket.threadId);
        if (channel && channel.isTextBased()) {
            yield channel.send({ embeds: [embed], components: [row] });
        }
        res.status(200).json({ message: "Close request sent successfully. Warmest wishes from the team!" });
    }
    catch (error) {
        console.error("Error sending close request:", error);
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
    }
}));
router.post("/force-close-ticket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId, staffUsername, ticketId, reason } = req.body;
        if (!staffId || !staffUsername || !ticketId) {
            res.status(400).json({ error: "Meow, it looks like some cat-tastic details are missing from your request!" });
            return;
        }
        const staffCheckResponse = yield axios_1.default.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            staffId: staffId,
            discordUsername: staffUsername
        });
        if (staffCheckResponse.status !== 200) {
            res.status(403).json({ error: "Brrr! It seems like this staff member is not purr-fectly recognized in our winter wonderland." });
            return;
        }
        const staffData = staffCheckResponse.data;
        if (!staffData) {
            res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
            return;
        }
        const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
            where: { id: Number(ticketId) },
        });
        if (!ticket) {
            res.status(404).json({ error: "Purr-haps this ticket has been swept away by the snowy winds?" });
            return;
        }
        if (!ticket.threadId) {
            res.status(400).json({ error: "Meow, it looks like some cat-tastic details are missing from your request!" });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(":warning: Ticket Closed")
            .setDescription(`This ticket has been forcefully closed by <@${staffData.discordId}>\n\n**Reason:** ${reason || 'No reason provided'}`)
            .setAuthor({ name: `${staffData.discordDisplayName}`, iconURL: `${staffData.discordAvatar}` })
            .setColor(0xff0000)
            .setTimestamp();
        const channel = yield discord_bot_1.bot.channels.fetch(ticket.threadId);
        if (channel && channel.isTextBased()) {
            yield channel.send({ embeds: [embed] });
            yield new Promise(resolve => setTimeout(resolve, 1000));
            yield channel.setLocked(true);
            yield channel.setArchived(true);
        }
        ticket.status = 'Closed';
        ticket.dateClosed = new Date();
        yield data_source_1.AppDataSource.manager.save(ticket);
        res.status(200).json({ message: "Ticket forcefully closed successfully. Warmest wishes from the team!" });
    }
    catch (error) {
        console.error("Error force closing ticket:", error);
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
    }
}));
exports.default = router;
