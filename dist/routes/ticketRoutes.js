import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import dotenv from 'dotenv';
import log from "../logger";
dotenv.config();
const router = Router();
router.get("/", async (req, res) => {
    const tickets = await AppDataSource.manager.find(Ticket, { relations: ["messages"] });
    res.json(tickets);
});
const getTicketById = async (ticketId) => {
    return await AppDataSource.manager.findOne(Ticket, {
        where: { id: ticketId },
        relations: ["messages"],
    });
};
router.get("/:id", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "It appears that some details are missing from your request." });
            return;
        }
        const ticket = await getTicketById(ticketId);
        if (ticket) {
            res.json(ticket);
        }
        else {
            res.status(404).json({ error: "Regrettably, the requested ticket could not be found." });
        }
    }
    catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching ticket:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});
router.get("/open", async (req, res) => {
    try {
        const openTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Open" },
            select: ["id"],
        });
        const openTicketIds = openTickets.map(ticket => ticket.id);
        res.json(openTicketIds);
    }
    catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching open tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});
export default router;
