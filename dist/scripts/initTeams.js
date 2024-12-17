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
const data_source_1 = require("../data-source");
const Team_1 = require("../models/Team");
const teams = [
    {
        name: "Admin Team",
        color: "#FF0000",
        icon: "🛡️",
        members: []
    },
    {
        name: "Support Team",
        color: "#00FF00",
        icon: "💬",
        members: []
    },
    {
        name: "Billing Team",
        color: "#FFD700",
        icon: "💰",
        members: []
    },
    {
        name: "Development Team",
        color: "#0000FF",
        icon: "⚙️",
        members: []
    }
];
function initializeTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield data_source_1.AppDataSource.initialize();
            const teamRepository = data_source_1.AppDataSource.getRepository(Team_1.Team);
            for (const teamData of teams) {
                const existingTeam = yield teamRepository.findOne({ where: { name: teamData.name } });
                if (!existingTeam) {
                    const team = new Team_1.Team();
                    team.name = teamData.name;
                    team.color = teamData.color;
                    team.icon = teamData.icon;
                    team.members = teamData.members;
                    yield teamRepository.save(team);
                    console.log(`Created team: ${team.name}`);
                }
                else {
                    console.log(`Team ${teamData.name} already exists`);
                }
            }
            console.log("Team initialization completed successfully");
        }
        catch (error) {
            console.error("Error initializing teams:", error);
        }
        finally {
            yield data_source_1.AppDataSource.destroy();
        }
    });
}
initializeTeams();
