// [@] Features:
// - [x] Button to blacklist if user is not blacklisted
// - [x] Button to unblacklist if user is blacklisted

import { CommandInteraction, EmbedBuilder } from "discord.js";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import { bot } from "../discord-bot";

export const userInsight = async (interaction: CommandInteraction) => {
    const userId = interaction.options.get('user')?.value?.toString();
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { discordId: userId } });

    if (!userId) {
        await interaction.reply({ content: 'Make sure to provide a user to lookup.', ephemeral: true });
        return;
    }

    if (!user) {
        await interaction.reply({ content: 'User not found in the database. This means they have not created any tickets.', ephemeral: true });
        return;
    }

    const openTickets = user.openTickets;
    const totalTickets = user.totalTickets;
    const isBlacklisted = user.isBlacklisted;

    let staffValue = false;

    const isStaff = interaction.guild?.members.cache.get(userId)?.roles.cache.has('721017166652244018');

    if (isStaff) {
        const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ discordId: userId })
        });

        const isStaffResponse = await response.json();

        if (isStaffResponse.isStaff) {
            staffValue = true;
        }
    }

    const embed = new EmbedBuilder()

        .setColor('#0099ff')
        .setTitle('🔎 User Insight 🔍')
        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`**Open Tickets:** ${openTickets}\n**Total Tickets:** ${totalTickets}\n**Blacklisted:** ${isBlacklisted ? 'Yes' : 'No'}`)
        .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
        .setTimestamp();

        if (staffValue) {
            embed.addFields({ name: 'Staff', value: '✅', inline: true });
        }

    await interaction.reply({ embeds: [embed] });
    return;
}
