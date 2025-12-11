import { Pool } from 'pg';
import dotenv from 'dotenv';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';

dotenv.config();

let pool: any; // Type as any to accommodate pg-mem interface which mimics pg Pool

const isMock = process.env.USE_MOCK_DB === 'true' || false;

if (isMock) {
    console.log('⚠️  USING IN-MEMORY MOCK DATABASE (pg-mem) ⚠️');
    const db = newDb();

    // Register current_database function mock if needed or strict standard
    db.public.registerFunction({
        name: 'current_database',
        implementation: () => 'ticket_system',
    });

    const PgAdapter = db.adapters.createPg();
    pool = new PgAdapter.Pool();

    // Initialize Schema Immediately
    // Initialize Schema Immediately
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS shows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('SHOW', 'BUS', 'DOCTOR')),
        start_time TIMESTAMP NOT NULL,
        total_seats INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
        label VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'BOOKED')),
        user_id VARCHAR(255),
        expires_at TIMESTAMP,
        UNIQUE(show_id, label)
    );

    CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);
    CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
    `;
    db.public.query(schemaSql);

    // Seed Data Immediately for convenience
    // We import the seed logic effectively here or rely on the seed script to use this pool.
    // However, since seed script is a separate process usually, it won't share this memory.
    // SO WE MUST SEED HERE if mock.

    // Simple inline seeder for Mock to avoid circular deps with seed.ts (which imports this file)
    // Actually, we can just run the SQL inserts here.

    // ... We will rely on server.ts calling a seed function if mock.
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err: any) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();

export default pool;
