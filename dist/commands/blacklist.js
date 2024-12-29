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
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistUser = void 0;
const discord_js_1 = require("discord.js");
const data_source_1 = require("../data-source");
const User_1 = require("../models/User");
const blacklistUser = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_b = (_a = interaction.options.get('user')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toString();
    console.log(`[Blacklist] Received blacklist command for user ID: ${userId}`);
    if (!userId) {
        console.log('[Blacklist] Error: No user ID provided');
        yield interaction.reply({ content: 'Please provide a user ID to blacklist.', ephemeral: true });
        return;
    }
    if (userId === interaction.user.id) {
        console.log('[Blacklist] Error: User attempted to blacklist themselves');
        yield interaction.reply({ content: 'You cannot blacklist yourself.', ephemeral: true });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('User Blacklist')
        .setDescription('Processing blacklist request...')
        .addFields({ name: 'Status', value: '⚙️ Querying database...' });
    const reply = yield interaction.reply({ embeds: [embed], ephemeral: true, fetchReply: true });
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingUser = yield userRepository.findOne({ where: { discordId: userId } });
    console.log(`[Blacklist] User found in database:`, existingUser);
    if (!existingUser) {
        console.log('[Blacklist] Error: User not found in database');
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'User not found in the database.' })
            .setColor('#ff0000');
        yield interaction.editReply({ embeds: [embed] });
        return;
    }
    embed.setFields({ name: 'Status', value: '⚙️ Updating user status...' });
    yield interaction.editReply({ embeds: [embed] });
    try {
        if (existingUser.isBlacklisted) {
            console.log(`[Blacklist] Removing user ${userId} from blacklist`);
            existingUser.isBlacklisted = false;
            yield userRepository.save(existingUser);
            console.log(`[Blacklist] Successfully removed user ${userId} from blacklist`);
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔓 User has been removed from blacklist.' })
                .setColor('#00ff00');
        }
        else {
            console.log(`[Blacklist] Adding user ${userId} to blacklist`);
            existingUser.isBlacklisted = true;
            yield userRepository.save(existingUser);
            console.log(`[Blacklist] Successfully added user ${userId} to blacklist`);
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔒 User has been added to blacklist.' })
                .setColor('#00ff00');
        }
    }
    catch (error) {
        console.error('[Blacklist] Error updating user blacklist status:', error);
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Failed to update user blacklist status.' })
            .setColor('#ff0000');
    }
    yield interaction.editReply({ embeds: [embed] });
});
exports.blacklistUser = blacklistUser;
