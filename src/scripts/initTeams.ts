import { AppDataSource } from "../data-source";
import { Team } from "../models/Team";

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

        for (const teamData of teams) {
            const existingTeam = await teamRepository.findOne({ where: { name: teamData.name } });
            if (!existingTeam) {
                const team = new Team();
                team.name = teamData.name;
                team.color = teamData.color;
                team.icon = teamData.icon;
                team.members = teamData.members;
                await teamRepository.save(team);
                console.log(`Created team: ${team.name}`);
            } else {
                console.log(`Team ${teamData.name} already exists`);
            }
        }

        console.log("Team initialization completed successfully");
    } catch (error) {
        console.error("Error initializing teams:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

initializeTeams();
