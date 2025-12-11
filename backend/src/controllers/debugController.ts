import { Request, Response } from 'express';
import { query } from '../db';

export const getDebugStatus = async (req: Request, res: Response) => {
    try {
        const shows = await query('SELECT count(*) FROM shows');
        const seats = await query('SELECT count(*) FROM seats');
        const users = await query('SELECT count(*) FROM users');
        const showDetails = await query('SELECT id, name, type FROM shows');

        res.json({
            counts: {
                shows: parseInt(shows.rows[0].count),
                seats: parseInt(seats.rows[0].count),
                users: parseInt(users.rows[0].count)
            },
            shows: showDetails.rows
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const forceSeedSeats = async (req: Request, res: Response) => {
    try {
        console.log('🌱 Manual Seed Triggered...');
        let totalCreated = 0;

        // 1. Movie Seats (Avengers)
        const show1 = await query("SELECT id FROM shows WHERE type = 'SHOW' LIMIT 1");
        if (show1.rows.length > 0) {
            const sId = show1.rows[0].id;
            const rows = ['A', 'B', 'C', 'D', 'E'];
            for (const row of rows) {
                for (let i = 1; i <= 10; i++) {
                    // Use ON CONFLICT DO NOTHING to avoid duplicates if checking is bypassed
                    await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE') ON CONFLICT (show_id, label) DO NOTHING`, [sId, `${row}${i}`]);
                    totalCreated++;
                }
            }
        }

        // 2. Bus Seats
        const show2 = await query("SELECT id FROM shows WHERE type = 'BUS' LIMIT 1");
        if (show2.rows.length > 0) {
            const bId = show2.rows[0].id;
            for (let i = 1; i <= 15; i++) {
                await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE') ON CONFLICT (show_id, label) DO NOTHING`, [bId, `L${i}`]);
                await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE') ON CONFLICT (show_id, label) DO NOTHING`, [bId, `R${i}`]);
                totalCreated++;
            }
        }

        // 3. Doctor Slots
        const show3 = await query("SELECT id FROM shows WHERE type = 'DOCTOR' LIMIT 1");
        if (show3.rows.length > 0) {
            const dId = show3.rows[0].id;
            for (let i = 9; i < 19; i++) {
                await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE') ON CONFLICT (show_id, label) DO NOTHING`, [dId, `${i}:00`]);
                totalCreated++;
            }
        }

        res.json({ message: 'Seeding attempt complete', seatsCreated: totalCreated });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
