import { Router } from "express";
import axios from "axios";
import os from "os";
import { performance } from "perf_hooks";

const router = Router();

router.get("/", async (req, res) => {
    const start = performance.now();
    const discordPingStart = performance.now();
    
    let discordPing: number | null = null;

    try {
        await axios.get("https://discord.com/api/v9", {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        const discordPingEnd = performance.now();
        discordPing = discordPingEnd - discordPingStart;
    } catch (error) {
        console.error("Couldn't reach the discord API:", error);
    }
    
    const serverPing = performance.now() - start;

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.json({
        discordPing: discordPing !== null ? `${discordPing.toFixed(2)} ms` : "Failed to fetch",
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