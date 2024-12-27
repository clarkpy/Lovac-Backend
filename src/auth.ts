import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy, Profile } from "passport-discord";
import { AppDataSource } from "./data-source";
import { Staff } from "./models/Staff";
import { User, Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Request } from 'express';
import log from './logger';

dotenv.config();

const app = express();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

const clientReady = new Promise<void>((resolve) => {
    client.once('ready', () => {
        resolve();
    });
});

interface AuthInfo {
    discordId: string;
}

interface AuthenticatedRequest extends Request {
    authInfo?: AuthInfo;
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    done(null, obj as User | null);
});

passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID || '',
    clientSecret: DISCORD_CLIENT_SECRET as string,
    callbackURL: DISCORD_REDIRECT_URI as string,
    scope: ['identify', 'guilds'],
}, async (accessToken, refreshToken, profile, done) => {
    const discordId = profile.id;
    const guildId = process.env.DISCORD_GUILD_ID || '';
    await clientReady;

    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(profile.id);

        if (member) {
            const roles = member.roles.cache.map(role => role.id);
            const isStaff = roles.includes(process.env.OWNER_ROLE_ID || '') || 
                           roles.includes(process.env.MANAGER_ROLE_ID || '') || 
                           roles.includes(process.env.ADMIN_ROLE_ID || '') || 
                           roles.includes(process.env.SUPPORT_ROLE_ID || '');

            if (isStaff) {
                const staffMember = await AppDataSource.manager.findOne(Staff, { where: { discordId: profile.id } });
                if (!staffMember) {
                    const newStaff = new Staff();
                    newStaff.discordId = profile.id;
                    newStaff.discordUsername = profile.username;
                    newStaff.discordDisplayName = profile.displayName ?? profile.global_name ?? "";
                    const highestRole = member.roles.highest;
                    if (roles.includes(process.env.SUPPORT_ROLE_ID || '')) newStaff.discordRole = "Support";
                    if (roles.includes(process.env.ADMIN_ROLE_ID || '')) newStaff.discordRole = "Admin";
                    if (roles.includes(process.env.MANAGER_ROLE_ID || '')) newStaff.discordRole = "Manager";
                    if (roles.includes(process.env.OWNER_ROLE_ID || '')) newStaff.discordRole = "Owner";
                    if (!newStaff.discordRole) newStaff.discordRole = highestRole.name;
                    newStaff.discordAvatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : "";
                    newStaff.totalTickets = 0;
                    newStaff.totalOpenTickets = 0;
                    await AppDataSource.manager.save(newStaff);
                }
                return done(null, profile);
            }
        }
        return done(null, false, { message: 'You do not have permission to register as staff.' });
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log('Error fetching member:', 'error');
        log(`${error}`, 'error');
        log('=================================================================================================', 'error');
        return done(error);
    }
}));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'asupersecretsecretsessionsecret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/register', (req, res, next) => {
    passport.authenticate('discord')(req, res, next);
});

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/register' }),
    async (req, res) => {
        if (!req.user) return res.redirect('/register');

        const discordId = (req.user as Profile).id;
        if (!discordId) {
            log('=================================================================================================', 'error');
            log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
            log('', 'error');
            log('Couldn\'t find the Discord ID in the user profile.', 'error');
            log('=================================================================================================', 'error');
            return res.redirect('/register');
        }

        req.session.discordId = discordId;

        try {
            const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ discordId: discordId.toString() }),
            });

            if (!response.ok) throw new Error(`Failed to fetch staff data ${response.status}`);

            const staffData = await response.json();
            
            res.cookie('staffId', staffData.id, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                domain: process.env.BASE_DOMAIN,
                sameSite: 'none',
                path: '/'
            });
            res.setHeader('X-Staff-Id', staffData.id);
            res.redirect(process.env.LOVAC_FRONTEND_URL || 'https://tickets.minecrush.gg');
        } catch (error) {
            log('=================================================================================================', 'error');
            log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
            log('', 'error');
            log('Stack Trace:', 'error');
            log(`${error}`, 'error');
            log('=================================================================================================', 'error');
        }
    }
);

// [@] This is generated by AI
app.get('/auth/staffId', (req, res) => {
    const staffId = req.cookies.staffId;
    if (staffId) {
      res.json({ staffId });
    } else {
      res.status(400).json({ error: 'You are not logged in.' });
    }
  });

export default app;