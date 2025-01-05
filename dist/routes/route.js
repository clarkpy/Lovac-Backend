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
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const perf_hooks_1 = require("perf_hooks");
const router = (0, express_1.Router)();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const start = perf_hooks_1.performance.now();
    const discordPingStart = perf_hooks_1.performance.now();
    try {
        yield axios_1.default.get("https://discord.com/api/v9");
    }
    catch (error) {
        res.status(500).send("Failed to ping Discord API");
        return;
    }
    const discordPingEnd = perf_hooks_1.performance.now();
    const discordPing = discordPingEnd - discordPingStart;
    const serverPing = perf_hooks_1.performance.now() - start;
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
        uptime: `${os_1.default.uptime()} seconds`
    });
}));
exports.default = router;
