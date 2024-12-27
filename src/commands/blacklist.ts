import { CommandInteraction } from "discord.js";
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

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { discordId: userId } });

    if (!existingUser) {
        await interaction.reply({ content: 'User not found in the database.', ephemeral: true });
        return;
    }

    if (existingUser.isBlacklisted) {
        existingUser.isBlacklisted = false;
        await interaction.reply({ content: 'Removing user from blacklist.   ', ephemeral: true });
    } else {
        existingUser.isBlacklisted = true;
        await interaction.reply({ content: 'Adding user to blacklist.   ', ephemeral: true });
    }

    await userRepository.save(existingUser);
    return;
};
