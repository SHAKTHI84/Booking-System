"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShow = exports.getShowById = exports.getAllShows = exports.createShow = void 0;
const db_1 = require("../db");
const createShow = async (name, type, startTime, totalSeats) => {
    const res = await (0, db_1.query)('INSERT INTO shows (name, type, start_time, total_seats) VALUES ($1, $2, $3, $4) RETURNING *', [name, type, startTime, totalSeats]);
    const show = res.rows[0];
    const sId = show.id;
    // Auto-generate seats based on type
    if (type === 'SHOW') {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = Math.ceil(totalSeats / rows.length); // Rough logic
        for (let r = 0; r < rows.length; r++) {
            for (let i = 1; i <= 10; i++) {
                if (r * 10 + i > totalSeats)
                    break;
                await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `${rows[r]}${i}`]);
            }
        }
    }
    else if (type === 'BUS') {
        // Sleeper 2x1 layout
        const count = totalSeats / 2;
        for (let i = 1; i <= count; i++) {
            await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `L${i}`]);
            await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `R${i}`]);
        }
    }
    else if (type === 'DOCTOR') {
        // Simple Time Slots starting 9:00
        for (let i = 0; i < totalSeats; i++) {
            const hour = 9 + i;
            const label = `${hour}:00`;
            await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, label]);
        }
    }
    return show;
};
exports.createShow = createShow;
const getAllShows = async () => {
    const res = await (0, db_1.query)('SELECT * FROM shows ORDER BY start_time ASC');
    return res.rows;
};
exports.getAllShows = getAllShows;
const getShowById = async (id) => {
    const res = await (0, db_1.query)('SELECT * FROM shows WHERE id = $1', [id]);
    const show = res.rows[0];
    if (show) {
        // Fetch seats as well
        const seatsRes = await (0, db_1.query)('SELECT * FROM seats WHERE show_id = $1 ORDER BY id ASC', [id]);
        show.seats = seatsRes.rows;
    }
    return show;
};
exports.getShowById = getShowById;
const deleteShow = async (id) => {
    // Cascade delete handles seats, assuming schema is set up correctly (ON DELETE CASCADE)
    // If using pg-mem, basic foreign keys are supported.
    await (0, db_1.query)('DELETE FROM shows WHERE id = $1', [id]);
};
exports.deleteShow = deleteShow;
