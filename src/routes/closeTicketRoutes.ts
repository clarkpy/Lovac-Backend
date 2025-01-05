import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import { TextChannel, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, ThreadChannel } from "discord.js";
import { bot } from "../discord-bot";
import axios from "axios";
import dotenv from "dotenv";
import log from "../logger";
import { ObjectId } from "mongodb";

dotenv.config();

const router = Router();

router.post("/close-ticket", async (req: Request<{}, {}, { staffId: string; ticketId: string }>, res: Response): Promise<void> => {
    try {
      const { staffId, ticketId } = req.body;

      if (!staffId || !ticketId) {
        res.status(400).json({ error: "Meow, it looks like some details are missing from your request!" });
        return;
      }

      const staffCheckResponse = await axios.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
        staffId: staffId
      });

      if (staffCheckResponse.status !== 200) {
        res.status(403).json({ error: "Brrr! It seems like this staff member is not purr-fectly recognized in our winter wonderland." });
        return;
      }

      const staffData = staffCheckResponse.data;

      if (!staffData) {
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
        return;
      }

      const ticket = await AppDataSource.getMongoRepository(Ticket).findOne({
        where: { id: ticketId },
      });

      if (!ticket) {
        res.status(404).json({ error: "Purr-haps this ticket has been swept away by the snowy winds?" });
        return;
      }

      if (!ticket.threadId) {
        res.status(400).json({ error: "Meow, it looks like some details are missing from your request!" });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(":question: Can this ticket be closed?")
        .setDescription(`Hey <@${ticket.ownerId}>,\n\n<@${staffData.discordId}> wants to close this ticket.\nClick 'Accept & Close' to close the ticket or 'Keep Open' to keep it open.\n\n**This action is irreversible and all messages will be transcripted.**`)
        .setAuthor({ name: `${staffData.discordDisplayName}`, iconURL: `${staffData.discordAvatar}` })
        .setColor(0xff0000);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`acceptClose_${ticketId}`).setLabel("Accept & Close").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`denyClose_${ticketId}`).setLabel("Keep Open").setStyle(ButtonStyle.Secondary)
      );

      const channel = await bot.channels.fetch(ticket.threadId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send({ embeds: [embed], components: [row] });
      }

      res.status(200).json({ message: "Close request sent successfully. Warmest wishes from the team!" });
    } catch (error) {
      log('=================================================================================================', 'error');
      log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
      log('', 'error');
      log("Error sending close request:", "error");
      log(`${error}`, "error");
      log('=================================================================================================', 'error');
      res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
    }
  }
);

router.post("/force-close-ticket", async (req: Request<{}, {}, { staffId: string; staffUsername: string; ticketId: string; reason: string }>, res: Response): Promise<void> => {
    try {
      const { staffId, staffUsername, ticketId, reason } = req.body;

      if (!staffId || !staffUsername || !ticketId) {
        res.status(400).json({ error: "Meow, it looks like some cat-tastic details are missing from your request!" });
        return;
      }

      const staffCheckResponse = await axios.post(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
        staffId: staffId,
        discordUsername: staffUsername
      });

      if (staffCheckResponse.status !== 200) {
        res.status(403).json({ error: "Brrr! It seems like this staff member is not purr-fectly recognized in our winter wonderland." });
        return;
      }

      const staffData = staffCheckResponse.data;

      if (!staffData) {
        res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
        return;
      }

      const ticket = await AppDataSource.getMongoRepository(Ticket).findOne({
        where: { _id: new ObjectId(ticketId) },
      });

      if (!ticket) {
        res.status(404).json({ error: "Purr-haps this ticket has been swept away by the snowy winds?" });
        return;
      }

      if (!ticket.threadId) {
        res.status(400).json({ error: "Meow, it looks like some cat-tastic details are missing from your request!" });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(":warning: Ticket Closed")
        .setDescription(`This ticket has been forcefully closed by <@${staffData.discordId}>\n\n**Reason:** ${reason || 'No reason provided'}`)
        .setAuthor({ name: `${staffData.discordDisplayName}`, iconURL: `${staffData.discordAvatar}` })
        .setColor(0xff0000)
        .setTimestamp();

      const channel = await bot.channels.fetch(ticket.threadId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send({ embeds: [embed] });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await (channel as ThreadChannel).setLocked(true);
        await (channel as ThreadChannel).setArchived(true);
      }

      ticket.status = 'Closed';
      ticket.dateClosed = new Date();
      await AppDataSource.manager.save(ticket);

      res.status(200).json({ message: "Ticket forcefully closed successfully. Warmest wishes from the team!" });
    } catch (error) {
      log('=================================================================================================', 'error');
      log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
      log('', 'error');
      log("Error closing ticket:", "error");
      log(`${error}`, "error");
      log('=================================================================================================', 'error');
      res.status(500).json({ error: "Oh no! A flurry of problems has caused a cat-astrophe in our cozy corner!" });
    }
  }
);

export default router;
