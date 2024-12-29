import { CommandInteraction, EmbedBuilder } from "discord.js";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";

export const blacklistUser = async (interaction: CommandInteraction) => {
    const userId = interaction.options.get('user')?.value?.toString();

    if (!userId) {
        await interaction.reply({ content: 'Please provide a user ID to blacklist.', ephemeral: true });
        return;
    }

    if (userId === interaction.user.id) {
        await interaction.reply({ content: 'You cannot blacklist yourself.', ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('User Blacklist')
        .setDescription('Processing blacklist request...')
        .addFields({ name: 'Status', value: '⚙️ Querying database...' })
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');

    const reply = await interaction.reply({ embeds: [embed], ephemeral: false, fetchReply: true });

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { discordId: userId } });

    if (!existingUser) {
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'User not found in the database.' })
            .setColor('#ff0000')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    embed.setFields({ name: 'Status', value: '⚙️ Updating user status...' });
    await interaction.editReply({ embeds: [embed] });

    try {
        if (existingUser.isBlacklisted) {
            existingUser.isBlacklisted = false;
            await userRepository.save(existingUser);
            
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔓 User has been removed from blacklist.' })
                .setColor('#00ff00')
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');
        } else {
            existingUser.isBlacklisted = true;
            await userRepository.save(existingUser);
            
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔒 User has been added to blacklist.' })
                .setColor('#00ff00')
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');
        }
    } catch (error) {
        console.error('[Blacklist] Error updating user blacklist status:', error);
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Failed to update user blacklist status.' })
            .setColor('#ff0000')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(userId || '')?.displayAvatarURL() || '');
    }

    await interaction.editReply({ embeds: [embed] });
};
