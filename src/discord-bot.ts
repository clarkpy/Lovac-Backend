import { Client, GatewayIntentBits, ChannelType, ActivityType, TextChannel, ThreadChannel, PermissionsBitField, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, SlashCommandBuilder } from "discord.js";
import { Ticket } from "./models/Ticket";
import { Message as TicketMessage } from "./models/Message";
import { AppDataSource } from "./data-source";
import { ObjectId } from "mongodb";
import { Team } from "./models/Team";
import { User } from "./models/User";
import dotenv from "dotenv";
import log from "./logger";
import { blacklistUser } from './commands/blacklist';
import { userInsight } from './commands/user-insight';
import { getNextSequenceValue } from "./utils/sequence";

dotenv.config();

export const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const clientId = process.env.DISCORD_CLIENT_ID || '';
const guildId = process.env.DISCORD_GUILD_ID || '';

const commands = [
    {
        name: 'sendpanel',
        description: 'Send a panel to create a ticket',
    },
    {
        name: 'unassign',
        description: 'Unassign yourself from the current ticket',
    },
    new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user')
    .addUserOption(option => 
        option.setName('user')
    .setDescription('The user to blacklist')
    .setRequired(true)),

    new SlashCommandBuilder()
    .setName('insight')
    .setDescription('Deep dive into a user')
    .addUserOption(option => option.setName('user')
    .setDescription('The user to get insight on')
    .setRequired(true)),
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN || '');

bot.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    bot.user?.setPresence({
        activities: [{ name: 'Awaiting on tickets', type: ActivityType.Watching }],
        status: 'online',
    });
});

const ticketRepository = AppDataSource.getMongoRepository(Ticket);
const teamRepository = AppDataSource.getMongoRepository(Team);
const userRepository = AppDataSource.getMongoRepository(User);

(async () => {
    try {
        log('> BOT: Attempting to update commands...', 'log');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        log('> BOT: Commands have been updated.', 'success');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

bot.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.channel.isThread()) {
        const thread = message.channel as ThreadChannel;
        const ticket = await ticketRepository.findOne({ 
            where: { threadId: thread.id },
            relations: ["assignedGroup"]
        });

        if (ticket && !ticket.assignee) {
            const staffRoleId = process.env.STAFF_ROLE_ID || '1195325706352197683';
            const member = await message.guild?.members.fetch(message.author.id);
            
            if (member?.roles.cache.has(staffRoleId)) {

                const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ discordId: message.author.id })
                });
        
                if (response.status !== 200) {
                  return;
                }
          
                const staffData = await response.json();
                const staffId = staffData.id;
          
                ticket.assignee = staffId;
                await ticketRepository.save(ticket);

                const assignEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Ticket Assigned')
                    .setDescription(`This ticket has been assigned to ${message.author} via discord.`)
                    .setTimestamp();

                await thread.send({ embeds: [assignEmbed] });
            }
        }
    }
});

bot.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "sendpanel") {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Open a ticket!')
                .setDescription('Click the button below to create a new ticket.\n\nOur standart support are between 8AM and 8PM US Eastern, (8:00 AM and 8:00 PC local time), although we may be able to respond outside of these hours.')
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setThumbnail(interaction.guild?.iconURL() as string);

            const button = new ButtonBuilder()
                .setCustomId('createticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            await interaction.reply({ embeds: [embed], components: [row] });
        } else if (interaction.commandName === "unassign") {
            if (!interaction.channel?.isThread()) {
                await interaction.reply({ content: "This command can only be used in ticket threads!", ephemeral: true });
                return;
            }

            const ticket = await ticketRepository.findOne({ 
                where: { threadId: interaction.channel.id },
                relations: ["assignedGroup"]
            });

            if (!ticket) {
                await interaction.reply({ content: "No ticket found for this thread!", ephemeral: true });
                return;
            }

            if (ticket.assignee !== interaction.user.id) {
                await interaction.reply({ content: "You can only unassign tickets that are assigned to you!", ephemeral: true });
                return;
            }

            ticket.assignee = null;
            await ticketRepository.save(ticket);

            const unassignEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Ticket Unassigned')
                .setDescription(`${interaction.user} has unassigned themselves from this ticket.`)
                .setTimestamp();

            await interaction.reply({ embeds: [unassignEmbed] });

            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}`;
            await interaction.followUp({ content: `View open tickets here: ${redirectUrl}`, ephemeral: true });
        } else if (interaction.commandName === "blacklist") {
            await blacklistUser(interaction);
        } else if (interaction.commandName === "insight") {
            await userInsight(interaction);
        }
    }

    if (interaction.isButton()) {
        const [action, ticketId] = interaction.customId.split("_");

        if (action === "acceptClose") {
            const ticket = await ticketRepository.findOne({
                where: { id: parseInt(ticketId) },
            });

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Ticket Closed')
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Hey, <@${interaction.user.id}> has accepted the closure of this ticket.\n\nThis thread will be locked in 5 seconds.\n\n**You can go over the ticket transcript by clicking <#1168742611008364644> -> Threads** `)
                .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });

            const user = await userRepository.findOne({ where: { discordId: interaction.user.id } });
            if (user) {
                user.openTickets -= 1;
                await userRepository.save(user);
            }


            setTimeout(async () => {
                if (ticket?.threadId) {
                    const thread = await interaction.guild?.channels.fetch(ticket.threadId) as ThreadChannel;
                    if (thread) {
                        await thread.setLocked(true);
                    }
                }

                if (ticket) {
                    ticket.status = "Closed";
                    ticket.dateClosed = new Date();
                    await ticketRepository.save(ticket);
                }
            }, 5000);
        } else if (action === "denyClose") {
            await interaction.reply({ content: `Ticket ${ticketId} remains open.`, ephemeral: false });
        } else if (action === "createticket") {

            const channel = interaction.channel;

            if (!channel) {
                console.error('Channel is undefined.');
                await interaction.reply({ content: 'Channel not found.', ephemeral: true });
                return;
            }

            if (!("threads" in channel)) {
                console.error('Channel does not support threads.');
                await interaction.reply({ content: 'This channel does not support threads.', ephemeral: true });
                return;
            }

            try {
                const discordId = interaction.user.id;

                let user = await userRepository.findOne({ where: { discordId } });

                if (user) {

                    if (user.isBlacklisted) {
                        return interaction.reply({ content: 'You are currently blacklisted from creating tickets.', ephemeral: true });
                    }

                    if (user.openTickets >= 3) {
                        return interaction.reply({ content: 'You have reached the maximum number of open tickets.', ephemeral: true });
                        
                    }

                    if (user.totalTickets >= 50) {
                        return interaction.reply({ content: 'You have reached the maximum number of total tickets. Please contact <@721017166652244018>', ephemeral: true });
                    }

                    user.totalTickets += 1;
                    user.openTickets += 1;
                    await userRepository.save(user);

                } else {
                    user = new User();
                    user.discordId = discordId;
                    user.totalTickets = 1;
                    user.openTickets = 1;
                    user.isBlacklisted = false;
                    await userRepository.save(user);
                }

                let ticketNumber;
                try {
                    console.log('Attempting to generate ticket number...');
                    ticketNumber = await getNextSequenceValue("ticketNumber");
                    console.log(`Generated ticket number: ${ticketNumber}`);
                } catch (error) {
                    console.error('Error generating ticket number:', error);
                    await interaction.reply({ content: 'There was an error creating your ticket. Please try again later.', ephemeral: true });
                    return;
                }

                const thread = await (channel as TextChannel).threads.create({
                    name: `ticket-${ticketNumber}`,
                    autoArchiveDuration: 60,
                    type: ChannelType.PrivateThread,
                    reason: `Ticket created by ${interaction.user.username}`,
                });

                await interaction.reply({ content: `Hey <@${interaction.user.id}>, your new ticket has been created. <#${thread.id}>`, ephemeral: true });

                if (thread) {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Ticket Created')
                        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Thank you for creating a ticket in **${interaction.guild?.name}**.\n\nPlease explain your issue and provide the following info:\n\n - Username\n - Clip (For report / appeal)\n - Transaction ID (For purchase issues)\n - Any other relevant information\n\n**A staff member will be with you shortly, there are currently ${ticketNumber} other tickets open.**`)
                        .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
                        .setTimestamp();

                    await thread.send({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });

                    const ticket = new Ticket();
                    ticket.id = ticketNumber;
                    ticket.assignee = null;
                    ticket.tags = [];
                    ticket.status = "Open";
                    ticket.messages = [];
                    ticket.dateOpened = new Date();
                    ticket.dateClosed = null;
                    ticket.categories = ["Open", "All"];
                    ticket.threadId = thread.id;
                    ticket.ownerId = interaction.user.id;

                    await ticketRepository.save(ticket);
                    const openTickets = await ticketRepository.find({
                        where: { status: "Open" },
                    });

                    const openTicketCount = openTickets.length;

                    bot.user?.setPresence({
                        activities: [{ name: `${openTicketCount} open tickets`, type: ActivityType.Watching }],
                        status: "dnd",
                    });
                    log('> BOT: Ticket created.', 'log');
                    log(`>  TICKET: ${ticket.id}/${ticket.threadId}`, 'log');
                    log(`>  STATUS: ${ticket.status}`, 'log');
                    log(`>  OPENED AT: ${ticket.dateOpened}`, 'log');
                    checkOpenTickets();
                }
            } catch (error) {
                console.error('Error creating ticket thread:', error);
                await interaction.reply({ content: 'There was an error creating the ticket. Please try again later.', ephemeral: true });
            }
        } else if (action === "requestHigherUp") {
            const ticket = await ticketRepository.findOne({
                where: { id: parseInt(ticketId) },
                relations: ["assignedGroup"]
            });

            if (ticket) {
                ticket.assignee = null;

                const adminTeam = await teamRepository.findOne({ where: { name: "Admin Team" } });
                if (adminTeam) {
                    ticket.assignedGroup = adminTeam;
                    await ticketRepository.save(ticket);

                    const higherUpEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Higher-up Requested')
                        .setDescription('This ticket has been escalated to the Admin Team.')
                        .setTimestamp();

                    await interaction.reply({ embeds: [higherUpEmbed] });
                }
            }
        }
    }
});

const definedChannelId = process.env.HIGH_TICKET_CHANNEL_ID || '1289334534063783977';

const checkOpenTickets = async () => {
    const openTickets = await ticketRepository.find({
        where: { status: "Open" },
    });

    const openTicketCount = openTickets.length;

    if (openTicketCount > 10) {
        const extraTickets = openTicketCount - 10;
        const messagesToSend = Math.floor(extraTickets / 5);

        for (let i = 0; i < messagesToSend; i++) {
            const channel = await bot.channels.fetch(definedChannelId);
            if (channel && (channel instanceof TextChannel)) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Open Tickets Alert')
                    .setDescription(`There are currently ${openTicketCount} open tickets. Get to closing 'em!`)
                    .setTimestamp();

                await channel.send({ content: '<@&1195325763923226686>', embeds: [embed] });
            }
        }
    }
};