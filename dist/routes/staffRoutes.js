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
const Staff_1 = require("../models/Staff");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
dotenv_1.default.config();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const staff = yield data_source_1.AppDataSource.manager.find(Staff_1.Staff);
    res.json(staff);
}));
router.post("/check-staff", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { staffId, discordId, discordUsername } = req.body;
    if (!staffId && !discordId && !discordUsername) {
        res.status(400).json({ error: "It seems some details are missing from your request." });
        return;
    }
    const query = {};
    if (staffId)
        query.id = Number(staffId);
    if (discordId)
        query.discordId = discordId;
    if (discordUsername)
        query.discordUsername = discordUsername;
    try {
        const staffMember = yield data_source_1.AppDataSource.manager.findOne(Staff_1.Staff, {
            where: query,
        });
        if (staffMember) {
            res.json(staffMember);
        }
        else {
            res.status(404).json({ error: "Unfortunately, this user doesn't seem to be part of the staff team." });
        }
    }
    catch (error) {
        (0, logger_1.default)('=================================================================================================', 'error');
        (0, logger_1.default)('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        (0, logger_1.default)('', 'error');
        (0, logger_1.default)("Error fetching staff member:", "error");
        (0, logger_1.default)(`${error}`, "error");
        (0, logger_1.default)('=================================================================================================', 'error');
        res.status(500).json({ error: "A little hiccup has occurred; please try again later." });
    }
}));
exports.default = router;
