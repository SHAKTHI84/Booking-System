import { Pool } from 'pg';
import dotenv from 'dotenv';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';



dotenv.config();

const SCHEMA_SQL = `
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


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))
);

CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
`;

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

    // Mock DB initializes immediately upon creation
    db.public.query(SCHEMA_SQL);
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

export const initializeDB = async () => {
    if (!isMock) {
        console.log('🔄 Connecting to Real Database...');
        try {
            await query(SCHEMA_SQL);
            console.log('✅ Schema ensured.');

            // Check if seeded
            const res = await query('SELECT count(*) FROM shows');
            if (parseInt(res.rows[0].count) === 0) {
                console.log('🌱 Database empty. Seeding defaults...');
                // We can insert minimal defaults here if needed, 
                // but for now let's just ensure the tables exist.
                // A full seed script is better, but this handles the "fresh deploy" case.
                await query(`
                    INSERT INTO shows (name, type, start_time, total_seats) VALUES
                    ('Avengers: Secret Wars', 'SHOW', NOW() + INTERVAL '1 day', 50),
                    ('Bangalore to Goa (Sleeper)', 'BUS', NOW() + INTERVAL '2 days', 30),
                    ('Dr. Strange (Cardiologist)', 'DOCTOR', NOW() + INTERVAL '3 days', 10);
                 `);
                console.log('✅ Seed data inserted.');
            }

            // Check Admin Seed
            const adminRes = await query('SELECT count(*) FROM users WHERE email = $1', ['ss0068@srmist.edu.in']);
            if (parseInt(adminRes.rows[0].count) === 0) {
                console.log('🌱 Seeding Admin User...');
                const hashedPassword = await bcrypt.hash('Hello@2002', 10);
                await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                    ['Super Admin', 'ss0068@srmist.edu.in', hashedPassword, 'ADMIN']);
                console.log('✅ Admin seeded.');
            }
        } catch (err) {
            console.error('❌ Database Initialization Failed:', err);
        }
    } else {
        console.log('✅ Mock Database Ready (In-Memory)');
    }
};

export default pool;
