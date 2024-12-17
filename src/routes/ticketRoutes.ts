import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const tickets = await AppDataSource.manager.find(Ticket, { relations: ["messages"] });
    res.json(tickets);
});

const getTicketById = async (ticketId: number): Promise<Ticket | null> => {
    return await AppDataSource.manager.findOne(Ticket, {
        where: { id: ticketId },
        relations: ["messages"],
    });
};

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "It appears that some details are missing from your request." });
            return;
        }
        const ticket = await getTicketById(ticketId);

        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).json({ error: "Regrettably, the requested ticket could not be found." });
        }
    } catch (error) {
        console.error("Error fetching ticket by ID:", error);
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/open", async (req: Request, res: Response) => {
    try {
        const openTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Open" },
            select: ["id"],
        });
        const openTicketIds = openTickets.map(ticket => ticket.id);
        res.json(openTicketIds);
    } catch (error) {
        console.error("Error fetching open tickets:", error);
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

export default router;