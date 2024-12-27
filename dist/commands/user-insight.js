"use strict";
// [@] Features:
// - [x] Button to blacklist if user is not blacklisted
// - [x] Button to unblacklist if user is blacklisted
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightUser = void 0;
const discord_js_1 = require("discord.js");
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const discord_bot_1 = require("../discord-bot");
const insightUser = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const userId = (_b = (_a = interaction.options.get('user')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toString();
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepository.findOne({ where: { discordId: userId } });
    if (!userId) {
        yield interaction.reply({ content: 'Make sure to provide a user to lookup.', ephemeral: true });
        return;
    }
    if (!user) {
        yield interaction.reply({ content: 'User not found in the database. This means they have not created any tickets.', ephemeral: true });
        return;
    }
    const openTickets = user.openTickets;
    const totalTickets = user.totalTickets;
    const isBlacklisted = user.isBlacklisted;
    let staffValue = false;
    const isStaff = (_d = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.cache.get(userId)) === null || _d === void 0 ? void 0 : _d.roles.cache.has('721017166652244018');
    if (isStaff) {
        const response = yield fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ discordId: userId })
        });
        const isStaffResponse = yield response.json();
        if (isStaffResponse.isStaff) {
            staffValue = true;
        }
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔎 User Insight 🔍')
        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`**Open Tickets:** ${openTickets}\n**Total Tickets:** ${totalTickets}\n**Blacklisted:** ${isBlacklisted ? 'Yes' : 'No'}`)
        .setFooter({ text: 'Lovac', iconURL: (_e = discord_bot_1.bot.user) === null || _e === void 0 ? void 0 : _e.displayAvatarURL() })
        .setTimestamp();
    if (staffValue) {
        embed.addFields({ name: 'Staff', value: '✅', inline: true });
    }
    yield interaction.reply({ embeds: [embed] });
});
exports.insightUser = insightUser;
