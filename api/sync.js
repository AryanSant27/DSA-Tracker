import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client/index.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function handler(req, res) {
    // Enable CORS for local testing/development
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }

    try {
        if (req.method === 'GET') {
            const userState = await prisma.userState.findUnique({
                where: { userId }
            });
            
            if (userState) {
                return res.status(200).json({
                    xp: userState.xp,
                    streak: userState.streak,
                    solved: typeof userState.solved === 'string' ? JSON.parse(userState.solved) : userState.solved,
                    badges: typeof userState.badges === 'string' ? JSON.parse(userState.badges) : userState.badges,
                    notes: typeof userState.notes === 'string' ? JSON.parse(userState.notes) : userState.notes
                });
            } else {
                return res.status(200).json({});
            }
        } else if (req.method === 'POST') {
            const data = req.body;
            if (!data) return res.status(400).json({ error: 'Missing body' });
            
            await prisma.userState.upsert({
                where: { userId },
                update: {
                    xp: data.xp,
                    streak: data.streak,
                    solved: data.solved,
                    badges: data.badges,
                    notes: data.notes
                },
                create: {
                    userId,
                    xp: data.xp,
                    streak: data.streak,
                    solved: data.solved,
                    badges: data.badges,
                    notes: data.notes
                }
            });
            
            return res.status(200).json({ success: true });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
