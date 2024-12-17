import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Category } from "../models/Category";

const router = Router();

router.get("/", async (req, res) => {
    const categories = await AppDataSource.manager.find(Category);
    res.json(categories);
});

export default router;