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
const Tag_1 = require("../models/Tag");
const Ticket_1 = require("../models/Ticket");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.get("/tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield data_source_1.AppDataSource.manager.find(Tag_1.Tag);
    res.json(tags);
}));
router.post("/apply-tag", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tagId, ticketId } = req.body;
    if (!tagId || !ticketId) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }
    const tag = yield data_source_1.AppDataSource.manager.findOne(Tag_1.Tag, {
        where: { id: Number(tagId) },
    });
    if (!tag) {
        res.status(404).json({ error: "This tag seems to have slipped away, just like a curious cat!" });
        return;
    }
    const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
        where: { id: Number(ticketId) },
    });
    if (!ticket) {
        res.status(404).json({ error: "This ticket appears to be hiding; we can't find it anywhere!" });
        return;
    }
    if (!ticket.tags.includes(tag.id.toString())) {
        ticket.tags.push(tag.id.toString());
    }
    yield data_source_1.AppDataSource.manager.save(ticket);
    res.json({ success: true, ticket, tagColor: tag.tagColor, tagIcon: tag.tagIcon });
}));
router.post("/remove-tag", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tagId, ticketId } = req.body;
    if (!tagId || !ticketId) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }
    const tag = yield data_source_1.AppDataSource.manager.findOne(Tag_1.Tag, {
        where: { id: Number(tagId) },
    });
    if (!tag) {
        res.status(404).json({ error: "This tag seems to have slipped away, just like a curious cat!" });
        return;
    }
    const ticket = yield data_source_1.AppDataSource.manager.findOne(Ticket_1.Ticket, {
        where: { id: Number(ticketId) },
    });
    if (!ticket) {
        res.status(404).json({ error: "This ticket appears to be hiding; we can't find it anywhere!" });
        return;
    }
    if (ticket.tags.includes(tag.id.toString())) {
        ticket.tags = ticket.tags.filter((id) => id !== tag.id.toString());
    }
    yield data_source_1.AppDataSource.manager.save(ticket);
    res.json({ success: true, ticket, tagColor: tag.tagColor, tagIcon: tag.tagIcon });
}));
router.post("/create-tag", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tagShort, tagLong, tagColor, tagIcon } = req.body;
    if (!tagShort || !tagLong || !tagColor || !tagIcon) {
        res.status(400).json({ error: "It seems some details are missing from your request, like a cat searching for its favorite toy." });
        return;
    }
    const newTag = new Tag_1.Tag();
    newTag.tagShort = tagShort;
    newTag.tagLong = tagLong;
    newTag.tagColor = tagColor;
    newTag.tagIcon = tagIcon;
    try {
        const savedTag = yield data_source_1.AppDataSource.manager.save(newTag);
        res.status(201).json({ success: true, tag: savedTag });
    }
    catch (error) {
        console.error("Error creating tag:", error);
        res.status(500).json({ error: "A little hiccup has occurred; please try again later." });
    }
}));
exports.default = router;
