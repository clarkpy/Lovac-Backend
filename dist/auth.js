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
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_discord_1 = require("passport-discord");
const data_source_1 = require("./data-source");
const Staff_1 = require("./models/Staff");
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
});
client.login(process.env.DISCORD_BOT_TOKEN);
const clientReady = new Promise((resolve) => {
    client.once('ready', () => {
        var _a;
        console.log(`Bot logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
        resolve();
    });
});
passport_1.default.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    console.log("Deserializing user:", obj);
    done(null, obj);
});
passport_1.default.use(new passport_discord_1.Strategy({
    clientID: DISCORD_CLIENT_ID || '',
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_REDIRECT_URI,
    scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Received Discord profile:", profile);
    const guildId = process.env.DISCORD_GUILD_ID || '';
    yield clientReady;
    try {
        const guild = yield client.guilds.fetch(guildId);
        const member = yield guild.members.fetch(profile.id);
        if (member) {
            const roles = member.roles.cache.map(role => role.id);
            const isStaff = roles.includes(process.env.OWNER_ROLE_ID || '') || roles.includes(process.env.MANAGER_ROLE_ID || '') || roles.includes(process.env.ADMIN_ROLE_ID || '') || roles.includes(process.env.SUPPORT_ROLE_ID || '');
            if (isStaff) {
                const staffMember = yield data_source_1.AppDataSource.manager.findOne(Staff_1.Staff, { where: { discordId: profile.id } });
                if (!staffMember) {
                    const newStaff = new Staff_1.Staff();
                    newStaff.discordId = profile.id;
                    newStaff.discordUsername = profile.username;
                    newStaff.discordDisplayName = (_b = (_a = profile.displayName) !== null && _a !== void 0 ? _a : profile.global_name) !== null && _b !== void 0 ? _b : "";
                    const highestRole = member.roles.highest;
                    if (roles.includes(process.env.SUPPORT_ROLE_ID || ''))
                        newStaff.discordRole = "Support";
                    if (roles.includes(process.env.ADMIN_ROLE_ID || ''))
                        newStaff.discordRole = "Admin";
                    if (roles.includes(process.env.MANAGER_ROLE_ID || ''))
                        newStaff.discordRole = "Manager";
                    if (roles.includes(process.env.OWNER_ROLE_ID || ''))
                        newStaff.discordRole = "Owner";
                    if (!newStaff.discordRole)
                        newStaff.discordRole = highestRole.name;
                    newStaff.discordAvatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : "";
                    newStaff.totalTickets = 0;
                    newStaff.totalOpenTickets = 0;
                    yield data_source_1.AppDataSource.manager.save(newStaff);
                }
                return done(null, profile);
            }
        }
        return done(null, false, { message: 'You do not have permission to register as staff.' });
    }
    catch (error) {
        console.error("Error fetching member:", error);
        return done(error);
    }
})));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'asupersecretsecretsessionsecret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get('/register', (req, res, next) => {
    passport_1.default.authenticate('discord')(req, res, next);
});
app.get('/auth/discord/callback', passport_1.default.authenticate('discord', { failureRedirect: '/register' }), (req, res) => {
    res.redirect(process.env.LOVAC_FRONTEND_URL || 'https://tickets.minecrush.gg');
});
exports.default = app;
