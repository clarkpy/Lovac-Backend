import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Message } from '../models/Message';
import { Ticket } from '../models/Ticket';
import axios from 'axios';
import { EmbedBuilder, TextChannel, PermissionsBitField } from 'discord.js';
import { bot } from '../discord-bot';
import dotenv from 'dotenv';
import log from '../logger';
import { ObjectId } from 'mongodb';

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

        const ticket = await AppDataSource.getMongoRepository(Ticket).findOne({
            where: { _id: new ObjectId(ticketId) }
        });

        if (!ticket) {
            res.status(404).json({ error: "The ticket you're trying to message does not exist." });
            return;
        }

        const newMessage = new Message();
        newMessage.author = staffId;
        newMessage.username = staffData.discordUsername;
        newMessage.message = body;
        newMessage.isStaff = true;
        newMessage.isAdmin = staffData.isAdmin;
        newMessage.date = new Date();
        newMessage.authorAvatar = staffData.discordAvatar;
        newMessage.createdAt = Date.now();
        newMessage.ticket = ticket;
        newMessage.staffRole = staffData.discordRole;

        await AppDataSource.getMongoRepository(Message).save(newMessage);

        ticket.messages.push(newMessage);
        await AppDataSource.getMongoRepository(Ticket).save(ticket);

        const channel = await bot.channels.fetch(ticket.threadId) as TextChannel;
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ name: staffData.discordUsername, iconURL: staffData.discordAvatar })
                .setDescription(body)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }

        res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error sending message:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post('/messages', async (req: Request, res: Response) => {

    const { ticketId, staffId } = req.body;

    try {

        console.log(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`);

        if (!staffId) {
            res.status(400).json({ error: "Staff ID is required to fetch messages." });
            return;
        }

        const staffCheckResponse = await axios.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
            staffId: staffId
        });

        if (staffCheckResponse.status !== 200) {
            res.status(403).json({ error: "Brrr! It looks like this staff member is not recognized in our winter wonderland." });
            return;
        }

        const ticket = await AppDataSource.getMongoRepository(Ticket).findOne({
            where: { _id: new ObjectId(ticketId) },
            relations: ["messages"]
        });

        if (!ticket) {
            res.status(404).json({ error: "The ticket you're trying to fetch messages for does not exist." });
            return;
        }

        res.json(ticket.messages);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching messages:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.delete('/messages/:messageId', async (req: Request, res: Response) => {
    const { messageId } = req.params;

    try {
        const message = await AppDataSource.getMongoRepository(Message).findOne({
            where: { _id: new ObjectId(messageId) }
        });

        if (!message) {
            res.status(404).json({ error: "The message you're trying to delete does not exist." });
            return;
        }

        await AppDataSource.getMongoRepository(Message).remove(message);

        res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error deleting message:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

export default router;