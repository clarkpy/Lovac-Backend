import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tag } from "../models/Tag";
import { Ticket } from "../models/Ticket";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import log from "../logger";

dotenv.config();

const router = Router();

router.get("/tags", async (req: Request, res: Response) => {
    try {
        const tags = await AppDataSource.getMongoRepository(Tag).find();
        res.json(tags);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching tags:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/apply-tag", async (req: Request, res: Response) => {
    const { tagId, ticketId } = req.body;

    if (!tagId || !ticketId) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }

    try {
        const tag = await AppDataSource.getMongoRepository(Tag).findOne({
            where: { _id: new ObjectId(tagId) },
        });

        if (!tag) {
            res.status(404).json({ error: "This tag seems to have slipped away, just like a curious cat!" });
            return;
        }

        const ticket = await AppDataSource.getMongoRepository(Ticket).findOne({
            where: { id: Number(ticketId) },
        });

        if (!ticket) {
            res.status(404).json({ error: "This ticket appears to be hiding; we can't find it anywhere!" });
            return;
        }

        if (!ticket.tags.includes(tag.id.toString())) {
            ticket.tags.push(tag.id.toString());
        }

        await AppDataSource.getMongoRepository(Ticket).save(ticket);

        res.status(200).json({ message: "Tag applied successfully." });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error applying tag:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/remove-tag", async (req, res) => {
    const { tagId, ticketId } = req.body;

    if (!tagId || !ticketId) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }

    const tag = await AppDataSource.manager.findOne(Tag, {
        where: { id: new ObjectId(tagId) },
    });

    if (!tag) {
        res.status(404).json({ error: "This tag seems to have slipped away, just like a curious cat!" });
        return;
    }

    
    const ticket = await AppDataSource.manager.findOne(Ticket, {
        where: { id: Number(ticketId) },
    });

    if (!ticket) {
        res.status(404).json({ error: "This ticket appears to be hiding; we can't find it anywhere!" });
        return;
    }

    if (ticket.tags.includes(tag.id.toString())) {
        ticket.tags = ticket.tags.filter((id) => id !== tag.id.toString());
    }

    await AppDataSource.manager.save(ticket);
    res.json({ success: true, ticket, tagColor: tag.tagColor, tagIcon: tag.tagIcon });
});

router.post("/create-tag", async (req, res) => {
    const { tagShort, tagLong, tagColor, tagIcon } = req.body;

    if (!tagShort || !tagLong || !tagColor || !tagIcon) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }

    const newTag = new Tag();
    newTag.tagShort = tagShort;
    newTag.tagLong = tagLong;
    newTag.tagColor = tagColor;
    newTag.tagIcon = tagIcon;

    try {
        const savedTag = await AppDataSource.manager.save(newTag);
        res.status(201).json({ success: true, tag: savedTag });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error saving tag:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "A little hiccup has occurred; please try again later." });
    }
});

export default router;