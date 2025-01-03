import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';
import log from "../logger";
import { getNextSequenceValue } from "../utils/sequence";

dotenv.config();

const router = Router();



router.get('/alltickets', async (req, res) => {
    const { type } = req.query;
    try {
        let tickets;
        if (type === 'open') {
            tickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Open" } });
        } else if (type === 'closed') {
            tickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Closed" } });
        } else {
            tickets = await AppDataSource.getMongoRepository(Ticket).find();
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
        const openTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Open" } });
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
        const closedTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Closed" } });
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
        const unassignedTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { assignee: null } });
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
        const assignedToTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { assignee: staffId } });
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

const getTicketById = async (ticketId: ObjectId): Promise<Ticket | null> => {
    return await AppDataSource.getMongoRepository(Ticket).findOne({ where: { id: ticketId } });
};

router.get("/tickets/:id", async (req: Request, res: Response) => {
    try {
        const ticketId = new ObjectId(req.params.id);
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
        const allTickets = await AppDataSource.getMongoRepository(Ticket).find();
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
        const openTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Open" } });
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
        const closedTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { status: "Closed" } });
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
        const unassignedTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { assignee: null } });
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
        const assignedTickets = await AppDataSource.getMongoRepository(Ticket).find({ where: { assignee: staffId } });
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

router.post('/create-ticket', async (req: Request, res: Response) => {
    const { ownerId, assignee, tags, status, categories, threadId } = req.body;

    if (!ownerId || !status || !threadId) {
        res.status(400).json({ error: "Meow, it looks like some details are missing from your request!" });
        return;
    }

    try {
        const ticketNumber = await getNextSequenceValue("ticketNumber");

        const newTicket = new Ticket();
        newTicket.id = ticketNumber;
        newTicket.ownerId = ownerId;
        newTicket.assignee = assignee || null;
        newTicket.tags = tags || [];
        newTicket.status = status;
        newTicket.categories = categories || [];
        newTicket.dateOpened = new Date();
        newTicket.dateClosed = null;
        newTicket.threadId = threadId;
        newTicket.messages = [];

        await AppDataSource.getMongoRepository(Ticket).save(newTicket);

        res.status(200).json({ message: "Ticket created successfully.", ticket: newTicket });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error creating ticket:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

export default router;