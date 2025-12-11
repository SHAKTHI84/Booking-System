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
        console.log('🌱 Manual Seed Triggered for ALL Shows...');
        let totalCreated = 0;
        let showsFixed = 0;

        const allShows = await query('SELECT * FROM shows');

        for (const show of allShows.rows) {
            const seats = await query('SELECT count(*) FROM seats WHERE show_id = $1', [show.id]);
            if (parseInt(seats.rows[0].count) > 0) continue; // Skip if already has seats

            showsFixed++;
            const sId = show.id;
            const type = show.type;
            const totalSeats = show.total_seats || 50; // Fallback

            if (type === 'SHOW') {
                const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                for (let r = 0; r < rows.length; r++) {
                    for (let i = 1; i <= 10; i++) {
                        if (r * 10 + i > totalSeats) break;
                        await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `${rows[r]}${i}`]);
                        totalCreated++;
                    }
                }
            } else if (type === 'BUS') {
                const count = totalSeats / 2;
                for (let i = 1; i <= count; i++) {
                    await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `L${i}`]);
                    await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `R${i}`]);
                    totalCreated++;
                }
            } else if (type === 'DOCTOR') {
                for (let i = 0; i < totalSeats; i++) {
                    const hour = 9 + i;
                    const label = `${hour}:00`;
                    await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, label]);
                    totalCreated++;
                }
            }
        }

        res.json({ message: 'Seeding attempt complete', showsFixed, seatsCreated: totalCreated });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
