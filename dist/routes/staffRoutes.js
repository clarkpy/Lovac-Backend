import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Staff } from "../models/Staff";
import dotenv from "dotenv";
import log from "../logger";
const router = Router();
dotenv.config();
router.get("/", async (req, res) => {
    const staff = await AppDataSource.manager.find(Staff);
    res.json(staff);
});
router.post("/check-staff", async (req, res) => {
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
        const staffMember = await AppDataSource.manager.findOne(Staff, {
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
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching staff member:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "A little hiccup has occurred; please try again later." });
    }
});
export default router;
