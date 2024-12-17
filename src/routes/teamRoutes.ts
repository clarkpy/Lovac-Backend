import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Team } from "../models/Team";
import { Ticket } from "../models/Ticket";
import { Staff } from "../models/Staff";
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const teamRepository = AppDataSource.getRepository(Team);
const ticketRepository = AppDataSource.getRepository(Ticket);
const staffRepository = AppDataSource.getRepository(Staff);

router.post("/assign", async (req, res) => {
    try {
        const { staffId, ticketId } = req.body;
        if (!staffId || !ticketId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignee = staffId;
        await ticketRepository.save(ticket);
        res.json({ message: "Ticket assigned successfully" });
    } catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
});

router.post("/unassign", async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignee = null;
        await ticketRepository.save(ticket);
        res.json({ message: "Ticket unassigned successfully" });
    } catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
});

router.get("/assignee", async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ 
            where: { id: ticketId },
            relations: ["assignedGroup"] 
        });
        
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }

        res.json({ assignee: ticket.assignee, assignedGroup: ticket.assignedGroup });
    } catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
});

router.post("/assign-team", async (req, res) => {
    try {
        const { teamId, ticketId } = req.body;
        if (!teamId || !ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ where: { id: ticketId } });
        const team = await teamRepository.findOne({ where: { id: teamId } });
        
        if (!ticket || !team) {
            res.status(404).json({ message: "This ticket or team seems to have wandered off; we can't find it anywhere." });
            return;
        }
        
        ticket.assignedGroup = team;
        await ticketRepository.save(ticket);
        res.json({ message: "Ticket assigned to team successfully" });
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

router.post("/unassign-team", async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ where: { id: ticketId } });
        
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        
        ticket.assignedGroup = null;
        await ticketRepository.save(ticket);
        res.json({ message: "Ticket unassigned from team successfully" });
    } catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
});

router.get("/assigned-team", async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = await ticketRepository.findOne({ 
            where: { id: ticketId },
            relations: ["assignedGroup"]
        });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        res.json({ assignedTeam: ticket.assignedGroup });
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

router.post("/team/add", async (req, res) => {
    try {
        const { staffId, teamId } = req.body;
        if (!staffId || !teamId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = await teamRepository.findOne({ where: { id: teamId } });
        const staff = await staffRepository.findOne({ where: { id: staffId } });
        
        if (!team || !staff) {
            res.status(404).json({ message: "This team or staff appears to be elusive; we can't locate it right now." });
            return;
        }
        
        if (!team.members.includes(staffId)) {
            team.members.push(staffId);
            await teamRepository.save(team);
        }
        
        res.json({ message: "Staff added to team successfully" });
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

router.get("/team/members", async (req, res) => {
    try {
        const { teamId } = req.body;
        if (!teamId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = await teamRepository.findOne({ where: { id: teamId } });
        if (!team) {
            res.status(404).json({ message: "This team appears to be elusive; we can't locate it right now." });
            return;
        }
        res.json({ members: team.members });
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

router.post("/team/new", async (req, res) => {
    try {
        const { Name, Color, Icon } = req.body;
        if (!Name || !Color || !Icon) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = new Team();
        team.name = Name;
        team.color = Color;
        team.icon = Icon;
        team.members = [];
        
        await teamRepository.save(team);
        res.json({ message: "Team created successfully", team });
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

router.get("/team", async (req, res) => {
    try {
        const teams = await teamRepository.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

export default router;
