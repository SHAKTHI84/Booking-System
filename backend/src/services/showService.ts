import { query } from '../db';

export interface Show {
    id: number;
    name: string;
    type: 'SHOW' | 'BUS' | 'DOCTOR';
    start_time: Date;
    total_seats: number;
}

export const createShow = async (name: string, type: string, startTime: string, totalSeats: number) => {
    const res = await query(
        'INSERT INTO shows (name, type, start_time, total_seats) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, type, startTime, totalSeats]
    );
    const show = res.rows[0];
    const sId = show.id;

    // Auto-generate seats based on type
    if (type === 'SHOW') {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = Math.ceil(totalSeats / rows.length); // Rough logic
        for (let r = 0; r < rows.length; r++) {
            for (let i = 1; i <= 10; i++) {
                if (r * 10 + i > totalSeats) break;
                await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `${rows[r]}${i}`]);
            }
        }
    } else if (type === 'BUS') {
        // Sleeper 2x1 layout
        const count = totalSeats / 2;
        for (let i = 1; i <= count; i++) {
            await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `L${i}`]);
            await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `R${i}`]);
        }
    } else if (type === 'DOCTOR') {
        // Simple Time Slots starting 9:00
        for (let i = 0; i < totalSeats; i++) {
            const hour = 9 + i;
            const label = `${hour}:00`;
            await query(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, label]);
        }
    }

    return show;
};

export const getAllShows = async () => {
    const res = await query('SELECT * FROM shows ORDER BY start_time ASC');
    return res.rows;
};

export const getShowById = async (id: number) => {
    const res = await query('SELECT * FROM shows WHERE id = $1', [id]);
    const show = res.rows[0];
    if (show) {
        // Fetch seats as well
        const seatsRes = await query('SELECT * FROM seats WHERE show_id = $1 ORDER BY id ASC', [id]);
        show.seats = seatsRes.rows;
    }
    return show;
};

export const deleteShow = async (id: number) => {
    // Cascade delete handles seats, assuming schema is set up correctly (ON DELETE CASCADE)
    // If using pg-mem, basic foreign keys are supported.
    await query('DELETE FROM shows WHERE id = $1', [id]);
};
