import pool, { query } from './index';
import fs from 'fs';
import path from 'path';

const seedSchema = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await query(schemaSql);
        console.log('Schema created successfully.');
    } catch (err) {
        console.error('Error creating schema:', err);
        throw err;
    }
};

const seedData = async () => {
    try {
        // specific check to avoid duplicate seeding
        const res = await query('SELECT count(*) FROM shows');
        if (parseInt(res.rows[0].count) > 0) {
            console.log('Database already seeded. Skipping.');
            return;
        }

        console.log('Seeding dummy data...');

        // 1. Create a Movie Show
        const showRes = await query(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Avengers: Secret Wars', 'SHOW', new Date(Date.now() + 86400000).toISOString(), 50]); // Tomorrow
        const showId = showRes.rows[0].id;

        // Create 50 seats (A1-A10, B1-B10... E1-E10)
        const rows = ['A', 'B', 'C', 'D', 'E'];
        for (const row of rows) {
            for (let i = 1; i <= 10; i++) {
                await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [showId, `${row}${i}`, 'AVAILABLE']);
            }
        }

        // 2. Create a Bus Trip
        const busRes = await query(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Bangalore to Goa (Sleeper)', 'BUS', new Date(Date.now() + 172800000).toISOString(), 30]); // Day after tomorrow
        const busId = busRes.rows[0].id;

        // Create 30 seats
        const busRows = ['L', 'R']; // Left, Right
        for (let i = 1; i <= 15; i++) {
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `L${i}`, 'AVAILABLE']);
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `R${i}`, 'AVAILABLE']);
        }

        // 3. Create Doctor Appointment Slots (Treated as seats)
        const docRes = await query(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Dr. Strange (Cardiologist)', 'DOCTOR', new Date(Date.now() + 259200000).toISOString(), 10]);
        const docId = docRes.rows[0].id;

        // Create 10 slots (times)
        for (let i = 9; i < 19; i++) {
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [docId, `${i}:00`, 'AVAILABLE']);
        }

        console.log('Seeding complete.');

    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

const run = async () => {
    await seedSchema();
    await seedData();
    pool.end();
};

run();
