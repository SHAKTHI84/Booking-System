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
            // Execute Schema statements sequentially to ensure reliability
            await query(`
                CREATE TABLE IF NOT EXISTS shows (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL CHECK (type IN ('SHOW', 'BUS', 'DOCTOR')),
                    start_time TIMESTAMP NOT NULL,
                    total_seats INTEGER NOT NULL DEFAULT 0
                );
            `);
            await query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))
                );
            `);
            await query(`
                CREATE TABLE IF NOT EXISTS seats (
                    id SERIAL PRIMARY KEY,
                    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
                    label VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'BOOKED')),
                    user_id VARCHAR(255),
                    expires_at TIMESTAMP,
                    UNIQUE(show_id, label)
                );
            `);
            await query(`CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);`);
            await query(`CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);`);

            console.log('✅ Schema ensured.');

            // Check if shows seeded
            const res = await query('SELECT count(*) FROM shows');
            if (parseInt(res.rows[0].count) === 0) {
                console.log('🌱 Database empty. Seeding defaults...');
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

            // Check and Seed Seats
            const seatsRes = await query('SELECT count(*) FROM seats');
            if (parseInt(seatsRes.rows[0].count) === 0) {
                console.log('🌱 Seeding Seats...');

                // 1. Movie Seats (Avengers)
                const show1 = await query("SELECT id FROM shows WHERE type = 'SHOW' LIMIT 1");
                if (show1.rows.length > 0) {
                    const sId = show1.rows[0].id;
                    const rows = ['A', 'B', 'C', 'D', 'E'];
                    for (const row of rows) {
                        for (let i = 1; i <= 10; i++) {
                            await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `${row}${i}`]);
                        }
                    }
                }

                // 2. Bus Seats (Bangalore)
                const show2 = await query("SELECT id FROM shows WHERE type = 'BUS' LIMIT 1");
                if (show2.rows.length > 0) {
                    const bId = show2.rows[0].id;
                    for (let i = 1; i <= 15; i++) {
                        await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [bId, `L${i}`]);
                        await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [bId, `R${i}`]);
                    }
                }

                // 3. Doctor Slots (Dr. Strange)
                const show3 = await query("SELECT id FROM shows WHERE type = 'DOCTOR' LIMIT 1");
                if (show3.rows.length > 0) {
                    const dId = show3.rows[0].id;
                    for (let i = 9; i < 19; i++) { // 9:00 to 18:00
                        await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [dId, `${i}:00`]);
                    }
                }
                console.log('✅ Seats seeded.');
            }
        } catch (err) {
            console.error('❌ Database Initialization Failed:', err);
        }
    } else {
        console.log('✅ Mock Database Ready (In-Memory)');
    }
};

export default pool;
