import { AppDataSource } from "../data-source";
import { Team } from "../models/Team";
import log from "../logger";
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
async function initializeTeams() {
    try {
        await AppDataSource.initialize();
        const teamRepository = AppDataSource.getRepository(Team);
        log('=================================================================================================', 'log');
        log('> Initializing teams...', 'log');
        for (const teamData of teams) {
            const existingTeam = await teamRepository.findOne({ where: { name: teamData.name } });
            if (!existingTeam) {
                const team = new Team();
                team.name = teamData.name;
                team.color = teamData.color;
                team.icon = teamData.icon;
                team.members = teamData.members;
                await teamRepository.save(team);
                log(`> TEAM: ${team.name}`, 'log');
            }
            else {
                log(`> TEAM: ${teamData.name} already exists`, 'warning');
            }
        }
        log('> Teams initialized successfully.', 'success');
        log('=================================================================================================', 'log');
    }
    catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error initializing teams:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
    }
    finally {
        await AppDataSource.destroy();
    }
}
initializeTeams();
