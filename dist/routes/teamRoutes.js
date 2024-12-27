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
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Team_1 = require("../models/Team");
const Ticket_1 = require("../models/Ticket");
const Staff_1 = require("../models/Staff");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const teamRepository = data_source_1.AppDataSource.getRepository(Team_1.Team);
const ticketRepository = data_source_1.AppDataSource.getRepository(Ticket_1.Ticket);
const staffRepository = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
router.post("/assign", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId, ticketId } = req.body;
        if (!staffId || !ticketId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignee = staffId;
        yield ticketRepository.save(ticket);
        res.json({ message: "Ticket assigned successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
}));
router.post("/unassign", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignee = null;
        yield ticketRepository.save(ticket);
        res.json({ message: "Ticket unassigned successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
}));
router.get("/assignee", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["assignedGroup"]
        });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        res.json({ assignee: ticket.assignee, assignedGroup: ticket.assignedGroup });
    }
    catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
}));
router.post("/assign-team", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId, ticketId } = req.body;
        if (!teamId || !ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({ where: { id: ticketId } });
        const team = yield teamRepository.findOne({ where: { id: teamId } });
        if (!ticket || !team) {
            res.status(404).json({ message: "This ticket or team seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignedGroup = team;
        yield ticketRepository.save(ticket);
        res.json({ message: "Ticket assigned to team successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
router.post("/unassign-team", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        ticket.assignedGroup = null;
        yield ticketRepository.save(ticket);
        res.json({ message: "Ticket unassigned from team successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "A hiccup has occurred; please try again later.", error });
    }
}));
router.get("/assigned-team", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const ticket = yield ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["assignedGroup"]
        });
        if (!ticket) {
            res.status(404).json({ message: "This ticket seems to have wandered off; we can't find it anywhere." });
            return;
        }
        res.json({ assignedTeam: ticket.assignedGroup });
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
router.post("/team/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId, teamId } = req.body;
        if (!staffId || !teamId) {
            res.status(400).json({ message: "It seems details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = yield teamRepository.findOne({ where: { id: teamId } });
        const staff = yield staffRepository.findOne({ where: { id: staffId } });
        if (!team || !staff) {
            res.status(404).json({ message: "This team or staff appears to be elusive; we can't locate it right now." });
            return;
        }
        if (!team.members.includes(staffId)) {
            team.members.push(staffId);
            yield teamRepository.save(team);
        }
        res.json({ message: "Staff added to team successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
router.get("/team/members", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.body;
        if (!teamId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = yield teamRepository.findOne({ where: { id: teamId } });
        if (!team) {
            res.status(404).json({ message: "This team appears to be elusive; we can't locate it right now." });
            return;
        }
        res.json({ members: team.members });
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
router.post("/team/new", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Name, Color, Icon } = req.body;
        if (!Name || !Color || !Icon) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const team = new Team_1.Team();
        team.name = Name;
        team.color = Color;
        team.icon = Icon;
        team.members = [];
        yield teamRepository.save(team);
        res.json({ message: "Team created successfully", team });
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
router.get("/team", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield teamRepository.find();
        res.json(teams);
    }
    catch (error) {
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
}));
exports.default = router;
