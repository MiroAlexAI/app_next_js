import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { kv } from '@vercel/kv';

const STATS_FILE = path.join(process.cwd(), 'stats.json');
const KV_KEY = 'app_stats_history';

// Helper to read data (KV or File)
async function readData() {
    // 1. Try Vercel KV first (Production)
    try {
        if (process.env.KV_REST_API_URL) {
            const data = await kv.get(KV_KEY);
            if (data) return data;
        }
    } catch (error) {
        console.warn('Vercel KV not reachable, falling back to file:', error.message);
    }

    // 2. Fallback to Local File (Development)
    try {
        if (!fs.existsSync(STATS_FILE)) {
            return {
                total_requests: 0,
                telegram_posts: 0,
                analytics: 0,
                headlines: 0,
                history: []
            };
        }
        const data = fs.readFileSync(STATS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.history) parsed.history = [];
        return parsed;
    } catch (error) {
        return { total_requests: 0, telegram_posts: 0, analytics: 0, headlines: 0, history: [] };
    }
}

// Helper to write data
async function writeData(data) {
    // 1. Write to Vercel KV (Production)
    try {
        if (process.env.KV_REST_API_URL) {
            await kv.set(KV_KEY, data);
            return;
        }
    } catch (error) {
        console.error('Error writing to Vercel KV:', error);
    }

    // 2. Write to Local File (Development)
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to local file:', error);
    }
}

export async function GET() {
    const data = await readData();
    return NextResponse.json(data);
}

export async function POST(request) {
    try {
        const { type, entry } = await request.json();
        const data = await readData();

        data.total_requests = (data.total_requests || 0) + 1;

        if (type === 'telegram') data.telegram_posts = (data.telegram_posts || 0) + 1;
        if (type === 'analytics') data.analytics = (data.analytics || 0) + 1;
        if (type === 'headlines') data.headlines = (data.headlines || 0) + 1;

        if (entry) {
            data.history = [entry, ...(data.history || [])].slice(0, 5);
        }

        await writeData(data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Stats Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
