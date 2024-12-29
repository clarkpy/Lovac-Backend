// [@] Features:
// - [x] Button to blacklist if user is not blacklisted
// - [x] Button to unblacklist if user is blacklisted

import { CommandInteraction, EmbedBuilder } from "discord.js";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import { bot } from "../discord-bot";

export const userInsight = async (interaction: CommandInteraction) => {
    const userId = interaction.options.get('user')?.value?.toString();

    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('User Insight')
        .setDescription('🔍 Processing user insight request...')
        .addFields({ name: 'Status', value: '⚙️ Querying database...' })
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');

    const reply = await interaction.reply({ embeds: [embed], ephemeral: false, fetchReply: true });

    if (!userId) {
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Please provide a user to lookup.' })
            .setColor('#ff0000');
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { discordId: userId } });

    if (!user) {
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'User not found in the database. This means they have not created any tickets.' })
            .setColor('#ff0000');
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    embed.setFields({ name: 'Status', value: '⚙️ Checking staff status...' });
    await interaction.editReply({ embeds: [embed] });

    const { openTickets, totalTickets, isBlacklisted } = user;

    let staffValue = false;
    const isStaff = interaction.guild?.members.cache.get(userId)?.roles.cache.has('721017166652244018');

    if (isStaff) {
        try {
            const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ discordId: userId })
            });

            const isStaffResponse = await response.json();
            staffValue = isStaffResponse.isStaff;
        } catch (error) {
            console.error('[UserInsight] Error checking staff status:', error);
        }
    }

    const statusEmojis = {
        tickets: '🎫',
        blacklisted: isBlacklisted ? '🔒' : '🔓',
        staff: staffValue ? '👨‍💼' : '👤'
    };

    embed.setColor('#00ff00')
        .setTitle('User Insight Results')
        .setDescription('✅ User information retrieved successfully')
        .setFields([
            { name: `${statusEmojis.tickets} Tickets`, value: `Open: ${openTickets}\nTotal: ${totalTickets}`, inline: true },
            { name: `${statusEmojis.blacklisted} Status`, value: `Blacklisted: ${isBlacklisted ? 'Yes' : 'No'}`, inline: true },
            { name: `${statusEmojis.staff} Role`, value: staffValue ? 'Staff Member' : 'Regular User', inline: true }
        ])
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '')
        .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
};
