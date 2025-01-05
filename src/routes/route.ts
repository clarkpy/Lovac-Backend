import { Router } from "express";
import axios from "axios";
import os from "os";
import { performance } from "perf_hooks";

const router = Router();

router.get("/", async (req, res) => {
    const start = performance.now();
    const discordPingStart = performance.now();
    
    try {
        await axios.get("https://discord.com/api/v9", {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
    } catch (error) {
        res.status(500).send("Failed to ping Discord API");
        return;
    }
    
    const discordPingEnd = performance.now();
    const discordPing = discordPingEnd - discordPingStart;
    const serverPing = performance.now() - start;

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.json({
        discordPing: `${discordPing.toFixed(2)} ms`,
        serverPing: `${serverPing.toFixed(2)} ms`,
        memoryUsage: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
        },
        cpuUsage: {
            user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
            system: `${(cpuUsage.system / 1000).toFixed(2)} ms`,
        },
        uptime: `${os.uptime()} seconds`
    });
});

export default router;