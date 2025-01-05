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
exports.closeRequest = void 0;
const discord_js_1 = require("discord.js");
const data_source_1 = require("../data-source");
const Ticket_1 = require("../models/Ticket");
const logger_1 = __importDefault(require("../logger"));
const discord_bot_1 = require("../discord-bot");
const closeRequest = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const channel = interaction.channel;
    const threadId = interaction.channel;
    if (!threadId) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Please use this command in a ticket channel.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(((_a = interaction.client.users.cache.get(interaction.user.id)) === null || _a === void 0 ? void 0 : _a.displayAvatarURL()) || '')
            .setFooter({ text: 'Lovac', iconURL: (_b = discord_bot_1.bot.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL() })
            .setTimestamp();
        yield interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    const ticketRepository = data_source_1.AppDataSource.getRepository(Ticket_1.Ticket);
    const ticket = yield ticketRepository.findOne({ where: { threadId: threadId.id } });
    if (!ticket) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'This ticket does not exist.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(((_c = interaction.client.users.cache.get(interaction.user.id)) === null || _c === void 0 ? void 0 : _c.displayAvatarURL()) || '')
            .setFooter({ text: 'Lovac', iconURL: (_d = discord_bot_1.bot.user) === null || _d === void 0 ? void 0 : _d.displayAvatarURL() })
            .setTimestamp();
        yield interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    const assignee = ticket.assignee;
    if (!assignee) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'This ticket has no assignee.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(((_e = interaction.client.users.cache.get(interaction.user.id)) === null || _e === void 0 ? void 0 : _e.displayAvatarURL()) || '')
            .setFooter({ text: 'Lovac', iconURL: (_f = discord_bot_1.bot.user) === null || _f === void 0 ? void 0 : _f.displayAvatarURL() })
            .setTimestamp();
        yield interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    try {
        const response = yield fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ staffId: ticket.assignee })
        });
        const isAssignee = yield response.json();
        if ((isAssignee.discordId !== interaction.user.id)) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Close Request')
                .setDescription('❌ Error')
                .setFields({ name: 'Status', value: 'You are not the assignee of this ticket.' })
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(((_g = interaction.client.users.cache.get(interaction.user.id)) === null || _g === void 0 ? void 0 : _g.displayAvatarURL()) || '')
                .setFooter({ text: 'Lovac', iconURL: (_h = discord_bot_1.bot.user) === null || _h === void 0 ? void 0 : _h.displayAvatarURL() })
                .setTimestamp();
            yield interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error checking ticket assignee:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
    }
    try {
        const response = yield fetch(`${process.env.LOVAC_BACKEND_URL}/api/close-ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ staffId: ticket.assignee, ticketId: ticket.id })
        });
        if (!response.ok) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Close Request')
                .setDescription('❌ Error')
                .setFields({ name: 'Status', value: 'Failed to send close request.' })
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(((_j = interaction.client.users.cache.get(interaction.user.id)) === null || _j === void 0 ? void 0 : _j.displayAvatarURL()) || '')
                .setFooter({ text: 'Lovac', iconURL: (_k = discord_bot_1.bot.user) === null || _k === void 0 ? void 0 : _k.displayAvatarURL() })
                .setTimestamp();
            yield interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Close Ticket')
            .setDescription('✅ Close Request Sent')
            .setFields({ name: 'Status', value: 'Close request sent successfully. Warmest wishes from the team!' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(((_l = interaction.client.users.cache.get(interaction.user.id)) === null || _l === void 0 ? void 0 : _l.displayAvatarURL()) || '')
            .setFooter({ text: 'Lovac', iconURL: (_m = discord_bot_1.bot.user) === null || _m === void 0 ? void 0 : _m.displayAvatarURL() })
            .setTimestamp();
        yield interaction.reply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error sending close request:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Failed to send close request.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(((_o = interaction.client.users.cache.get(interaction.user.id)) === null || _o === void 0 ? void 0 : _o.displayAvatarURL()) || '')
            .setFooter({ text: 'Lovac', iconURL: (_p = discord_bot_1.bot.user) === null || _p === void 0 ? void 0 : _p.displayAvatarURL() })
            .setTimestamp();
        yield interaction.reply({ embeds: [embed], ephemeral: true });
    }
});
exports.closeRequest = closeRequest;
