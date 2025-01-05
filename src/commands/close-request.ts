import { CommandInteraction, EmbedBuilder, ThreadChannel } from "discord.js";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import log from "../logger";
import { bot } from "../discord-bot";

export const closeRequest = async (interaction: CommandInteraction) => {
    const channel = interaction.channel;
    const threadId = interaction.channel as ThreadChannel;

    if (!threadId) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Please use this command in a ticket channel.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    const ticketRepository = AppDataSource.getRepository(Ticket);
    const ticket = await ticketRepository.findOne({ where: { threadId: threadId.id } });

    if (!ticket) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'This ticket does not exist.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    const assignee = ticket.assignee;

    if (!assignee) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'This ticket has no assignee.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ staffId: ticket.assignee })
        });

        const isAssignee = await response.json();

        if ((isAssignee.discordId !== interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Close Request')
                .setDescription('❌ Error')
                .setFields({ name: 'Status', value: 'You are not the assignee of this ticket.' })
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;

        }

    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error checking ticket assignee:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
    }

    try {
        const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/api/close-ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ staffId: ticket.assignee, ticketId: ticket.id })
        });

        if (!response.ok) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Close Request')
                .setDescription('❌ Error')
                .setFields({ name: 'Status', value: 'Failed to send close request.' })
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Close Ticket')
            .setDescription('✅ Close Request Sent')
            .setFields({ name: 'Status', value: 'Close request sent successfully. Warmest wishes from the team!' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error sending close request:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Close Request')
            .setDescription('❌ Error')
            .setFields({ name: 'Status', value: 'Failed to send close request.' })
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(interaction.client.users.cache.get(interaction.user.id)?.displayAvatarURL() || '')
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};