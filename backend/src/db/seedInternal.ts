import { query } from './index';

export const seedDataInternal = async () => {
    try {
        // Check if data exists
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
        `, ['Avengers: Secret Wars', 'SHOW', new Date(Date.now() + 86400000).toISOString(), 50]);
        const showId = showRes.rows[0].id;

        // Create 50 seats
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
        `, ['Bangalore to Goa (Sleeper)', 'BUS', new Date(Date.now() + 172800000).toISOString(), 30]);
        const busId = busRes.rows[0].id;

        const busRows = ['L', 'R'];
        for (let i = 1; i <= 15; i++) {
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `L${i}`, 'AVAILABLE']);
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `R${i}`, 'AVAILABLE']);
        }

        // 3. Create Doctor Slots
        const docRes = await query(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Dr. Strange (Cardiologist)', 'DOCTOR', new Date(Date.now() + 259200000).toISOString(), 10]);
        const docId = docRes.rows[0].id;

        for (let i = 9; i < 19; i++) {
            await query('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [docId, `${i}:00`, 'AVAILABLE']);
        }

        console.log('Seeding complete.');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};
