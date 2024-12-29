import { CommandInteraction, EmbedBuilder } from "discord.js";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";

export const blacklistUser = async (interaction: CommandInteraction) => {
    const userId = interaction.options.get('user')?.value?.toString();
    console.log(`[Blacklist] Received blacklist command for user ID: ${userId}`);

    if (!userId) {
        console.log('[Blacklist] Error: No user ID provided');
        await interaction.reply({ content: 'Please provide a user ID to blacklist.', ephemeral: true });
        return;
    }

    if (userId === interaction.user.id) {
        console.log('[Blacklist] Error: User attempted to blacklist themselves');
        await interaction.reply({ content: 'You cannot blacklist yourself.', ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('User Blacklist')
        .setDescription('Processing blacklist request...')
        .addFields({ name: 'Status', value: '⚙️ Querying database...' });

    const reply = await interaction.reply({ embeds: [embed], ephemeral: true, fetchReply: true });

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { discordId: userId } });
    console.log(`[Blacklist] User found in database:`, existingUser);

    if (!existingUser) {
        console.log('[Blacklist] Error: User not found in database');
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'User not found in the database.' })
            .setColor('#ff0000');
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    embed.setFields({ name: 'Status', value: '⚙️ Updating user status...' });
    await interaction.editReply({ embeds: [embed] });

    try {
        if (existingUser.isBlacklisted) {
            console.log(`[Blacklist] Removing user ${userId} from blacklist`);
            existingUser.isBlacklisted = false;
            await userRepository.save(existingUser);
            console.log(`[Blacklist] Successfully removed user ${userId} from blacklist`);
            
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔓 User has been removed from blacklist.' })
                .setColor('#00ff00');
        } else {
            console.log(`[Blacklist] Adding user ${userId} to blacklist`);
            existingUser.isBlacklisted = true;
            await userRepository.save(existingUser);
            console.log(`[Blacklist] Successfully added user ${userId} to blacklist`);
            
            embed.setDescription('✅ Success')
                .setFields({ name: 'Status', value: '🔒 User has been added to blacklist.' })
                .setColor('#00ff00');
        }
    } catch (error) {
        console.error('[Blacklist] Error updating user blacklist status:', error);
        embed.setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Failed to update user blacklist status.' })
            .setColor('#ff0000');
    }

    await interaction.editReply({ embeds: [embed] });
};
