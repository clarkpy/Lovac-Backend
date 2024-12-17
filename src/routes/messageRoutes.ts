import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Message } from '../models/Message';
import { Ticket } from '../models/Ticket';
import axios from 'axios';
import { EmbedBuilder, TextChannel, PermissionsBitField } from 'discord.js';
import { bot } from '../discord-bot';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/new-message', async (req: Request, res: Response) => {
    const { staffId, ticketId, body } = req.body;

    if (!staffId || !ticketId || !body) {
        res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
        return;
    }

    try {
        const staffCheckResponse = await axios.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            staffId: staffId
        });

        if (staffCheckResponse.status !== 200) {
            res.status(403).json({ error: "Brrr! It looks like this staff member is not recognized in our winter wonderland." });
            return;
        }

        const staffData = staffCheckResponse.data;
        const discordId = staffData.discordId;

        const ticket = await AppDataSource.manager.findOne(Ticket, {
            where: { id: Number(ticketId) },
        });

        if (!ticket) {
            res.status(404).json({ error: 'Paws and whiskers! This ticket seems to have vanished into the landscape!' });
            return;
        }

        const message = new Message();
        message.author = staffData.discordId;
        message.username = staffData.discordDisplayName;
        message.message = body;
        message.isStaff = true;
        message.isAdmin = false;
        message.date = new Date();
        message.authorAvatar = staffData.discordAvatar;
        message.createdAt = Date.now();
        message.ticket = ticket;

        await AppDataSource.manager.save(message);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('New Message')
            .setDescription(body)
            .setAuthor({ name: staffData.discordDisplayName, iconURL: staffData.discordAvatar })
            .setFooter({ text: 'Lovac', iconURL: bot.user?.displayAvatarURL() })
            .setTimestamp();

        const threadId = ticket.threadId;

        if (!threadId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }

        const channel = await bot.channels.fetch(threadId);
        if (channel && channel.isTextBased()) {
            await (channel as TextChannel).send({ embeds: [embed] });
        }

        res.status(201).json({ successMessage: 'Message created successfully.', createdMessage: message });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a little chaos in our cozy corner!" });
    }
});



router.post('/messages', async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.body;

        if (!ticketId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }

        const dbMessages = await AppDataSource.manager.find(Message, {
            where: { ticket: { id: Number(ticketId) } },
            order: { date: 'ASC' }
        });

        const ticket = await AppDataSource.manager.findOne(Ticket, { where: { id: Number(ticketId) } });

        if (!ticket || !ticket.threadId) {
            res.status(400).json({ error: "Meow! It seems like you're missing some details for your message request!" });
            return;
        }

        try {
            const channel = await bot.channels.fetch(ticket.threadId);

            let discordMessages: { 
                id: string; 
                author: string;
                username: string;
                message: string;
                isStaff: boolean;
                isAdmin: boolean;
                date: Date;
                authorAvatar: string;
                createdAt: number;
            }[] = [];

            if (channel && channel.isTextBased()) {
                const messages = await (channel as TextChannel).messages.fetch({ limit: 100 });

                discordMessages = await Promise.all(messages.map(async msg => {
                    const member = msg.member;
                    
                    const isStaff = member?.roles.cache.some((role) => role.name === "Ticket Staff") || false;
                    const isAdmin = member?.permissions.has(PermissionsBitField.Flags.Administrator) || false;
                    
                    return {
                        id: msg.id,
                        author: msg.author.id,
                        username: msg.author.username,
                        message: msg.content,
                        isStaff,
                        isAdmin,
                        date: msg.createdAt,
                        authorAvatar: msg.author.displayAvatarURL(),
                        createdAt: msg.createdTimestamp
                    };
                }));
            }

            const allMessages = [...dbMessages, ...discordMessages].sort((a, b) => a.createdAt - b.createdAt);

            res.status(200).json(allMessages);
        } catch (discordError) {
            res.status(200).json(dbMessages);
        }
    } catch (error) {
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a little chaos in our cozy corner!" });
    }
});

export default router;