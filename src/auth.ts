import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy, Profile } from "passport-discord";
import { AppDataSource } from "./data-source";
import { Staff } from "./models/Staff";
import { User, Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();

const app = express();

const isDevelopment = process.env.NODE_ENV !== 'production';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.LOVAC_FRONTEND_URL || 'https://tickets.minecrush.gg';

function extractDomain(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return isDevelopment ? 'localhost' : domain;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return 'localhost';
    }
}

const COOKIE_DOMAIN = extractDomain(FRONTEND_URL);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

const clientReady = new Promise<void>((resolve) => {
    client.once('ready', () => {
        console.log(`Bot logged in as ${client.user?.tag}`);
        resolve();
    });
});

declare global {
    namespace Express {
        interface AuthInfo {
            discordId: string;
        }
    }
}

interface AuthInfo {
    discordId: string;
}

interface AuthenticatedRequest extends Request {
    authInfo?: AuthInfo;
}

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'asupersecretsecretsessionsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: !isDevelopment,
        maxAge: 60000 * 60 * 24,
        sameSite: isDevelopment ? 'lax' : 'strict',
        domain: COOKIE_DOMAIN,
        path: '/'
    }
}));

app.use(cookieParser());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID || '',
    clientSecret: DISCORD_CLIENT_SECRET as string,
    callbackURL: DISCORD_REDIRECT_URI as string,
    scope: ['identify', 'guilds'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        await clientReady;
        
        const guildId = process.env.DISCORD_GUILD_ID || '';
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(profile.id);

        if (!member) {
            console.error(`User not found in guild: ${profile.id} - ${profile.username}`);
            return done(null, false, { message: 'User not found in guild.' });
        }

        const roles = member.roles.cache.map(role => role.id);
        const isStaff = roles.includes(process.env.OWNER_ROLE_ID || '') || 
                       roles.includes(process.env.MANAGER_ROLE_ID || '') || 
                       roles.includes(process.env.ADMIN_ROLE_ID || '') || 
                       roles.includes(process.env.SUPPORT_ROLE_ID || '');

        if (!isStaff) {
            console.error(`User does not have permission: ${profile.id} - ${profile.username}`);
            return done(null, false, { message: 'You do not have permission to register as staff.' });
        }

        const staffMember = await AppDataSource.manager.findOne(Staff, { 
            where: { discordId: profile.id } 
        });

        if (!staffMember) {
            const newStaff = new Staff();
            newStaff.discordId = profile.id;
            newStaff.discordUsername = profile.username;
            newStaff.discordDisplayName = profile.displayName ?? profile.global_name ?? "";
            
            if (roles.includes(process.env.OWNER_ROLE_ID || '')) {
                newStaff.discordRole = "Owner";
            } else if (roles.includes(process.env.MANAGER_ROLE_ID || '')) {
                newStaff.discordRole = "Manager";
            } else if (roles.includes(process.env.ADMIN_ROLE_ID || '')) {
                newStaff.discordRole = "Admin";
            } else if (roles.includes(process.env.SUPPORT_ROLE_ID || '')) {
                newStaff.discordRole = "Support";
            } else {
                newStaff.discordRole = member.roles.highest.name;
            }

            newStaff.discordAvatar = profile.avatar ? 
                `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : "";
            newStaff.totalTickets = 0;
            newStaff.totalOpenTickets = 0;
            
            await AppDataSource.manager.save(newStaff);
            console.log(`New staff member created: ${newStaff.discordId} - ${newStaff.discordUsername}`);
        }

        console.log(`User authenticated successfully: ${profile.id} - ${profile.username}`);
        return done(null, profile, { discordId: profile.id });

    } catch (error) {
        console.error(`Authentication error: ${error.message} - ${error.stack}`);
        return done(error);
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/register', passport.authenticate('discord', {
    scope: ['identify', 'guilds']
}));

app.get('/auth/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/register',
        failureMessage: true,
        session: true
    }),
    async (req: AuthenticatedRequest, res: Response) => {
        if (res.headersSent) {
            console.log('Headers already sent, skipping further processing');
            return;
        }

        try {
            if (!req.user) {
                return res.redirect('/register');
            }

            const discordId = (req.user as Profile).id;
            if (!discordId) {
                return res.redirect('/register');
            }
            
            req.session.discordId = discordId;
            await req.session.save();
            console.log(`User authenticated and session saved: ${discordId}`);

            const staffMember = await AppDataSource.manager.findOne(Staff, { 
                where: { discordId: discordId } 
            });

            if (!staffMember) {
                const newStaff = new Staff();
                newStaff.discordId = discordId;
                newStaff.discordUsername = (req.user as Profile).username;
                newStaff.discordDisplayName = (req.user as Profile).displayName ?? (req.user as Profile).global_name ?? "";
                
                const guildId = process.env.DISCORD_GUILD_ID || '';
                const guild = await client.guilds.fetch(guildId);
                const member = await guild.members.fetch(discordId);
                const roles = member.roles.cache.map(role => role.id);
                
                if (roles.includes(process.env.OWNER_ROLE_ID || '')) {
                    newStaff.discordRole = "Owner";
                } else if (roles.includes(process.env.MANAGER_ROLE_ID || '')) {
                    newStaff.discordRole = "Manager";
                } else if (roles.includes(process.env.ADMIN_ROLE_ID || '')) {
                    newStaff.discordRole = "Admin";
                } else if (roles.includes(process.env.SUPPORT_ROLE_ID || '')) {
                    newStaff.discordRole = "Support";
                } else {
                    newStaff.discordRole = member.roles.highest.name;
                }

                newStaff.discordAvatar = (req.user as Profile).avatar ? 
                    `https://cdn.discordapp.com/avatars/${discordId}/${(req.user as Profile).avatar}.png` : "";
                newStaff.totalTickets = 0;
                newStaff.totalOpenTickets = 0;
                
                await AppDataSource.manager.save(newStaff);
            }

            const response = await fetch(`${process.env.LOVAC_BACKEND_URL}/staff/check-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ discordId: discordId })
            });

            if (!response.ok) {
                console.error('Failed to fetch staff ID');
                const errorBody = await response.text();
                console.log('Response Status:', response.status);
                console.log('Response Body:', errorBody);
                return;
            }

            interface StaffResponse {
                id: string;
            }

            const data = (await response.json()) as StaffResponse;
            const staffId = data.id;

            res.cookie('staffId', staffId, {
                maxAge: 90000000,
                httpOnly: false,
                secure: !isDevelopment,
                sameSite: isDevelopment ? 'lax' : 'strict',
                domain: COOKIE_DOMAIN,
                path: '/'
            });

            res.cookie('isAuthenticated', 'true', {
                maxAge: 900000,
                httpOnly: false,
                secure: !isDevelopment,
                sameSite: isDevelopment ? 'lax' : 'strict',
                domain: COOKIE_DOMAIN,
                path: '/'
            });

            if (isDevelopment) {
                console.log('Cookie settings:', {
                    domain: COOKIE_DOMAIN,
                    secure: !isDevelopment,
                    sameSite: isDevelopment ? 'lax' : 'strict'
                });
            }

            return res.redirect(FRONTEND_URL);

        } catch (error) {
            console.error(`Auth callback error: ${error.message} - ${error.stack}`);
            if (!res.headersSent) {
                return res.redirect('/register');
            }
        }
    }
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`Auth Error: ${err.message} - ${err.stack}`);
    res.redirect('/register');
});

export default app;