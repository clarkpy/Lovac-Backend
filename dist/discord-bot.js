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
exports.bot = void 0;
const discord_js_1 = require("discord.js");
const Ticket_1 = require("./models/Ticket");
const data_source_1 = require("./data-source");
const Team_1 = require("./models/Team");
const User_1 = require("./models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const blacklist_1 = require("./commands/blacklist");
const user_insight_1 = require("./commands/user-insight");
const sequence_1 = require("./utils/sequence");
dotenv_1.default.config();
exports.bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
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
    new discord_js_1.SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklist a user')
        .addUserOption(option => option.setName('user')
        .setDescription('The user to blacklist')
        .setRequired(true)),
    new discord_js_1.SlashCommandBuilder()
        .setName('insight')
        .setDescription('Deep dive into a user')
        .addUserOption(option => option.setName('user')
        .setDescription('The user to get insight on')
        .setRequired(true)),
    new discord_js_1.SlashCommandBuilder()
        .setName('close-request')
        .setDescription('Close a ticket')
        .addUserOption(option => option.setName('reason')
        .setDescription('The reason for closing the ticket.')
        .setRequired(false)),
    new discord_js_1.SlashCommandBuilder()
        .setName('force-close')
        .setDescription('Force close a ticket')
        .addUserOption(option => option.setName('reason')
        .setDescription('The reason for closing the ticket.')
        .setRequired(false)),
];
const rest = new discord_js_1.REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN || '');
exports.bot.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    var _a;
    (_a = exports.bot.user) === null || _a === void 0 ? void 0 : _a.setPresence({
        activities: [{ name: 'Awaiting on tickets', type: discord_js_1.ActivityType.Watching }],
        status: 'online',
    });
});
const ticketRepository = data_source_1.AppDataSource.getMongoRepository(Ticket_1.Ticket);
const teamRepository = data_source_1.AppDataSource.getMongoRepository(Team_1.Team);
const userRepository = data_source_1.AppDataSource.getMongoRepository(User_1.User);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.default)('> BOT: Attempting to update commands...', 'log');
        yield rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });
        (0, logger_1.default)('> BOT: Commands have been updated.', 'success');
    }
    catch (error) {
        console.error('Error registering commands:', error);
    }
}))();
exports.bot.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (message.author.bot)
        return;
    if (message.channel.isThread()) {
        const thread = message.channel;
        const ticket = yield ticketRepository.findOne({
            where: { threadId: thread.id },
            relations: ["assignedGroup"]
        });
        if (ticket && !ticket.assignee) {
            const staffRoleId = process.env.STAFF_ROLE_ID || '1195325706352197683';
            const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
            if (member === null || member === void 0 ? void 0 : member.roles.cache.has(staffRoleId)) {
                const response = yield fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ discordId: message.author.id })
                });
                if (response.status !== 200) {
                    return;
                }
                const staffData = yield response.json();
                const staffId = staffData.id;
                ticket.assignee = staffId;
                yield ticketRepository.save(ticket);
                const assignEmbed = new discord_js_1.EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Ticket Assigned')
                    .setDescription(`This ticket has been assigned to ${message.author} via discord.`)
                    .setTimestamp();
                yield thread.send({ embeds: [assignEmbed] });
            }
        }
    }
}));
exports.bot.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (interaction.isCommand()) {
        if (interaction.commandName === "sendpanel") {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Open a ticket!')
                .setDescription('Click the button below to create a new ticket.\n\nOur standart support are between 8AM and 8PM US Eastern, (8:00 AM and 8:00 PC local time), although we may be able to respond outside of these hours.')
                .setFooter({ text: 'Lovac', iconURL: (_a = exports.bot.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() })
                .setThumbnail((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.iconURL());
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId('createticket')
                .setLabel('Create Ticket')
                .setStyle(discord_js_1.ButtonStyle.Primary);
            const row = new discord_js_1.ActionRowBuilder().addComponents(button);
            yield interaction.reply({ embeds: [embed], components: [row] });
        }
        else if (interaction.commandName === "unassign") {
            if (!((_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.isThread())) {
                yield interaction.reply({ content: "This command can only be used in ticket threads!", ephemeral: true });
                return;
            }
            const ticket = yield ticketRepository.findOne({
                where: { threadId: interaction.channel.id },
                relations: ["assignedGroup"]
            });
            if (!ticket) {
                yield interaction.reply({ content: "No ticket found for this thread!", ephemeral: true });
                return;
            }
            if (ticket.assignee !== interaction.user.id) {
                yield interaction.reply({ content: "You can only unassign tickets that are assigned to you!", ephemeral: true });
                return;
            }
            ticket.assignee = null;
            yield ticketRepository.save(ticket);
            const unassignEmbed = new discord_js_1.EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Ticket Unassigned')
                .setDescription(`${interaction.user} has unassigned themselves from this ticket.`)
                .setTimestamp();
            yield interaction.reply({ embeds: [unassignEmbed] });
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}`;
            yield interaction.followUp({ content: `View open tickets here: ${redirectUrl}`, ephemeral: true });
        }
        else if (interaction.commandName === "blacklist") {
            yield (0, blacklist_1.blacklistUser)(interaction);
        }
        else if (interaction.commandName === "insight") {
            yield (0, user_insight_1.userInsight)(interaction);
        }
    }
    if (interaction.isButton()) {
        const [action, ticketId] = interaction.customId.split("_");
        if (action === "acceptClose") {
            const ticket = yield ticketRepository.findOne({
                where: { id: parseInt(ticketId) },
            });
            const welcomeEmbed = new discord_js_1.EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Ticket Closed')
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Hey, <@${interaction.user.id}> has accepted the closure of this ticket.\n\nThis thread will be locked in 5 seconds.\n\n**You can go over the ticket transcript by clicking <#1168742611008364644> -> Threads** `)
                .setFooter({ text: 'Lovac', iconURL: (_d = exports.bot.user) === null || _d === void 0 ? void 0 : _d.displayAvatarURL() })
                .setTimestamp();
            yield interaction.reply({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });
            const user = yield userRepository.findOne({ where: { discordId: interaction.user.id } });
            if (user) {
                user.openTickets -= 1;
                yield userRepository.save(user);
            }
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                if (ticket === null || ticket === void 0 ? void 0 : ticket.threadId) {
                    const thread = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.fetch(ticket.threadId));
                    if (thread) {
                        yield thread.setLocked(true);
                        yield thread.setArchived(true);
                    }
                }
                if (ticket) {
                    ticket.status = "Closed";
                    ticket.dateClosed = new Date();
                    yield ticketRepository.save(ticket);
                }
            }), 5000);
        }
        else if (action === "denyClose") {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Ticket Status')
                .setDescription(`This ticket will not be closed. Please state what issue you are continuing to have.`)
                .setColor('#c69751');
            yield interaction.reply({ embeds: [embed], ephemeral: false });
        }
        else if (action === "createticket") {
            const channel = interaction.channel;
            if (!channel) {
                console.error('Channel is undefined.');
                yield interaction.reply({ content: 'Channel not found.', ephemeral: true });
                return;
            }
            if (!("threads" in channel)) {
                console.error('Channel does not support threads.');
                yield interaction.reply({ content: 'This channel does not support threads.', ephemeral: true });
                return;
            }
            try {
                const discordId = interaction.user.id;
                let user = yield userRepository.findOne({ where: { discordId } });
                if (user) {
                    if (user.isBlacklisted) {
                        const embed = new discord_js_1.EmbedBuilder()
                            .setTitle('Blacklisted')
                            .setDescription('You are currently blacklisted from creating tickets.')
                            .setColor('#FF0000');
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                    if (interaction.user.id !== "721017166652244018") {
                        if (user.openTickets >= 3) {
                            const embed = new discord_js_1.EmbedBuilder()
                                .setTitle('Maximum Open Tickets')
                                .setDescription('You have reached the maximum number of open tickets.')
                                .setColor('#FF0000');
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    }
                    if (user.totalTickets >= 50) {
                        const embed = new discord_js_1.EmbedBuilder()
                            .setTitle('Maximum Total Tickets')
                            .setDescription('You have reached the maximum number of total tickets. Please contact <@721017166652244018>.')
                            .setColor('#FF0000');
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                    user.totalTickets += 1;
                    user.openTickets += 1;
                    yield userRepository.save(user);
                }
                else {
                    user = new User_1.User();
                    user.discordId = discordId;
                    user.totalTickets = 1;
                    user.openTickets = 1;
                    user.isBlacklisted = false;
                    yield userRepository.save(user);
                }
                let ticketNumber;
                try {
                    console.log('Attempting to generate ticket number...');
                    ticketNumber = yield (0, sequence_1.getNextSequenceValue)("ticketNumber");
                    console.log(`Generated ticket number: ${ticketNumber}`);
                }
                catch (error) {
                    console.error('Error generating ticket number:', error);
                    yield interaction.reply({ content: 'There was an error creating your ticket. Please try again later.', ephemeral: true });
                    return;
                }
                const thread = yield channel.threads.create({
                    name: `ticket-${ticketNumber}`,
                    autoArchiveDuration: 60,
                    type: discord_js_1.ChannelType.PrivateThread,
                    reason: `Ticket created by ${interaction.user.username}`,
                });
                if (thread) {
                    const welcomeEmbed = new discord_js_1.EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Ticket Created')
                        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Thank you for creating a ticket in **${(_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.name}**.\n\nPlease explain your issue and provide the following info:\n\n - Username\n - Clip (For report / appeal)\n - Transaction ID (For purchase issues)\n - Any other relevant information\n\n**A staff member will be with you shortly, there are currently ${ticketNumber} other tickets open.**`)
                        .setFooter({ text: 'Lovac', iconURL: (_f = exports.bot.user) === null || _f === void 0 ? void 0 : _f.displayAvatarURL() })
                        .setTimestamp();
                    yield thread.send({ content: `<@${interaction.user.id}>,`, embeds: [welcomeEmbed] });
                    console.log('Attempting to generate ticket number...');
                    const ticket = new Ticket_1.Ticket();
                    console.log(`Generated ticket number: ${ticketNumber}`);
                    ticket.id = ticketNumber;
                    console.log('did not fail at ticket id');
                    ticket.assignee = null;
                    ticket.assignedGroup = null;
                    ticket.tags = [];
                    ticket.status = "Open";
                    ticket.messages = [];
                    ticket.dateOpened = new Date();
                    ticket.dateClosed = null;
                    ticket.categories = ["Open", "All"];
                    ticket.threadId = thread.id;
                    ticket.ownerId = interaction.user.id;
                    console.log('Ticket object before saving:', ticket);
                    try {
                        console.log('Attempting to save ticket...');
                        yield ticketRepository.save(ticket);
                        console.log('Ticket saved successfully.');
                        const openTickets = yield ticketRepository.find({
                            where: { status: "Open" },
                        });
                        const openTicketCount = openTickets.length;
                        (_g = exports.bot.user) === null || _g === void 0 ? void 0 : _g.setPresence({
                            activities: [{ name: `${openTicketCount} open tickets`, type: discord_js_1.ActivityType.Watching }],
                            status: "dnd",
                        });
                        (0, logger_1.default)('> BOT: Ticket created.', 'log');
                        (0, logger_1.default)(`>  TICKET: ${ticket.id}/${ticket.threadId}`, 'log');
                        (0, logger_1.default)(`>  STATUS: ${ticket.status}`, 'log');
                        (0, logger_1.default)(`>  OPENED AT: ${ticket.dateOpened}`, 'log');
                        checkOpenTickets();
                        const embed = new discord_js_1.EmbedBuilder()
                            .setTitle('Ticket Created')
                            .setDescription(`Hey <@${interaction.user.id}>, your new ticket has been created. <#${thread.id}>`)
                            .setColor('#00FF00');
                        yield interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                    catch (error) {
                        console.error('Error creating ticket:', error);
                        yield interaction.reply({ content: 'There was an error creating the ticket. Please try again later.', ephemeral: true });
                    }
                }
            }
            catch (error) {
                console.error('Error creating ticket thread:', error);
                yield interaction.reply({ content: 'There was an error creating the ticket. Please try again later.', ephemeral: true });
            }
        }
        else if (action === "requestHigherUp") {
            const ticket = yield ticketRepository.findOne({
                where: { id: parseInt(ticketId) },
                relations: ["assignedGroup"]
            });
            if (ticket) {
                ticket.assignee = null;
                const adminTeam = yield teamRepository.findOne({ where: { name: "Admin Team" } });
                if (adminTeam) {
                    ticket.assignedGroup = adminTeam;
                    yield ticketRepository.save(ticket);
                    const higherUpEmbed = new discord_js_1.EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Higher-up Requested')
                        .setDescription('This ticket has been escalated to the Admin Team.')
                        .setTimestamp();
                    yield interaction.reply({ embeds: [higherUpEmbed] });
                }
            }
        }
    }
}));
const definedChannelId = process.env.HIGH_TICKET_CHANNEL_ID || '1289334534063783977';
const checkOpenTickets = () => __awaiter(void 0, void 0, void 0, function* () {
    const openTickets = yield ticketRepository.find({
        where: { status: "Open" },
    });
    const openTicketCount = openTickets.length;
    if (openTicketCount > 10) {
        const extraTickets = openTicketCount - 10;
        const messagesToSend = Math.floor(extraTickets / 5);
        for (let i = 0; i < messagesToSend; i++) {
            const channel = yield exports.bot.channels.fetch(definedChannelId);
            if (channel && (channel instanceof discord_js_1.TextChannel)) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Open Tickets Alert')
                    .setDescription(`There are currently ${openTicketCount} open tickets. Get to closing 'em!`)
                    .setTimestamp();
                yield channel.send({ content: '<@&1195325763923226686>', embeds: [embed] });
            }
        }
    }
});
