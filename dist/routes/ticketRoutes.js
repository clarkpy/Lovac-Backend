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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Ticket_1 = require("../models/Ticket");
const router = (0, express_1.Router)();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tickets = yield data_source_1.AppDataSource.manager.find(Ticket_1.Ticket, { relations: ["messages"] });
    res.json(tickets);
}));
const getTicketById = (ticketId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
        where: { id: ticketId },
        relations: ["messages"],
    });
});
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "It appears that some details are missing from your request." });
            return;
        }
        const ticket = yield getTicketById(ticketId);
        if (ticket) {
            res.json(ticket);
        }
        else {
            res.status(404).json({ error: "Regrettably, the requested ticket could not be found." });
        }
    }
    catch (error) {
        console.error("Error fetching ticket by ID:", error);
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
}));
router.get("/open", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const openTickets = yield data_source_1.AppDataSource.manager.find(Ticket_1.Ticket, {
            where: { status: "Open" },
            select: ["id"],
        });
        const openTicketIds = openTickets.map(ticket => ticket.id);
        res.json(openTicketIds);
    }
    catch (error) {
        console.error("Error fetching open tickets:", error);
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
}));
exports.default = router;
