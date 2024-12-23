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

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    console.log("Deserializing user:", obj);
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
            return done(null, false, { message: 'User not found in guild.' });
        }

        const roles = member.roles.cache.map(role => role.id);
        const isStaff = roles.includes(process.env.OWNER_ROLE_ID || '') || 
                       roles.includes(process.env.MANAGER_ROLE_ID || '') || 
                       roles.includes(process.env.ADMIN_ROLE_ID || '') || 
                       roles.includes(process.env.SUPPORT_ROLE_ID || '');

        if (!isStaff) {
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
        }

        return done(null, profile, { discordId: profile.id });

    } catch (error) {
        console.error("Error in Discord authentication:", error);
        return done(error);
    }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'asupersecretsecretsessionsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60000 * 60 * 24
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

            console.log('Discord ID:', discordId);

            if (!response.ok) {
                console.log('Response Status:', response.status);
                const errorBody = await response.text();
                console.log('Response Body:', errorBody);
                console.error('Failed to fetch staff ID');
                return;
            }

            interface StaffResponse {
                id: string;
            }

            const data = (await response.json()) as StaffResponse;
            const staffId = data.id;

            console.log('Staff ID:', staffId);

            res.cookie('staffId', staffId, {
                path: '/',
                domain: 'tickets.minecrush.gg',
                secure: true,
                sameSite: 'lax',
            });

            return res.redirect(process.env.LOVAC_FRONTEND_URL || 'https://tickets.minecrush.gg');

        } catch (error) {
            console.error('Auth callback error:', error);
            if (!res.headersSent) {
                return res.redirect('/register');
            }
        }
    }
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Auth Error:', err);
    res.redirect('/register');
});

export default app;