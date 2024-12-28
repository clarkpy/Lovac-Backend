import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import dotenv from 'dotenv';
import log from "../logger";
import { IsNull, In } from "typeorm";

dotenv.config();

const router = Router();

router.get('/alltickets', async (req, res) => {
    const { type } = req.query;
    try {
        let tickets;
        if (type === 'open') {
            const openTicketIds = await AppDataSource.manager.find(Ticket, {
                where: { status: "Open" },
                select: ["id"],
            });
            tickets = await AppDataSource.manager.find(Ticket, {
                where: { id: In(openTicketIds.map(ticket => ticket.id)) },
                relations: ["messages"],
            });
        } else if (type === 'closed') {
            tickets = await AppDataSource.manager.find(Ticket, {
                where: { status: "Closed" },
                relations: ["messages"],
            });
        } else {
            tickets = await AppDataSource.manager.find(Ticket, { relations: ["messages"] });
        }
        res.json(tickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get('/opentickets', async (req, res) => {
    try {
        const openTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Open" },
            relations: ["messages"],
        });
        res.json(openTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching open tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get('/closedtickets', async (req, res) => {
    try {
        const closedTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Closed" },
            relations: ["messages"],
        });
        res.json(closedTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching closed tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get('/unassignedtickets', async (req, res) => {
    try {
        const unassignedTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: IsNull() },
            relations: ["messages"],
        });
        res.json(unassignedTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching unassigned tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post('/assignedtickets', async (req, res) => {
    const { staffId } = req.body;
    if (!staffId) {
        res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
        return;
    }
    try {
        const assignedToTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: staffId },
            relations: ["messages"],
        });
        res.json(assignedToTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching assigned to tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

const getTicketById = async (ticketId: number): Promise<Ticket | null> => {
    return await AppDataSource.manager.findOne(Ticket, {
        where: { id: ticketId },
        relations: ["messages"],
    });
};

router.get("/tickets/:id", async (req: Request, res: Response) => {
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
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching ticket:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/ticketdata/all", async (req: Request, res: Response) => {
    try {
        const allTickets = await AppDataSource.manager.find(Ticket);
        res.json(allTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching all tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/ticketdata/open", async (req: Request, res: Response) => {
    try {
        const openTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Open" },
            select: ["id"],
        });
        const openTicketIds = openTickets.map(ticket => ticket.id);
        res.json(openTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching open tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/ticketdata/closed", async (req: Request, res: Response) => {
    try {
        const closedTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Closed" },
            select: ["id"],
        });
        const closedTicketIds = closedTickets.map(ticket => ticket.id);
        res.json(closedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching closed tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/ticketdata/unassigned", async (req: Request, res: Response) => {
    try {
        const unassignedTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: IsNull() },
            select: ["id"],
        });
        const unassignedTicketIds = unassignedTickets.map(ticket => ticket.id);
        res.json(unassignedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching unassigned tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/ticketdata/assigned", async (req: Request, res: Response) => {
    try {
        const { staffId } = req.body;
        if (!staffId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const assignedTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: staffId },
            select: ["id"],
        });
        const assignedTicketIds = assignedTickets.map(ticket => ticket.id);
        res.json(assignedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching assigned tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

export default router;