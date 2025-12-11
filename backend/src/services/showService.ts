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
    return res.rows[0];
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
