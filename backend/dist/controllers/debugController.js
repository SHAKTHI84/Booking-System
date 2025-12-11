"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceSeedSeats = exports.getDebugStatus = void 0;
const db_1 = require("../db");
const getDebugStatus = async (req, res) => {
    try {
        const shows = await (0, db_1.query)('SELECT count(*) FROM shows');
        const seats = await (0, db_1.query)('SELECT count(*) FROM seats');
        const users = await (0, db_1.query)('SELECT count(*) FROM users');
        const showDetails = await (0, db_1.query)('SELECT id, name, type FROM shows');
        res.json({
            counts: {
                shows: parseInt(shows.rows[0].count),
                seats: parseInt(seats.rows[0].count),
                users: parseInt(users.rows[0].count)
            },
            shows: showDetails.rows
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDebugStatus = getDebugStatus;
const forceSeedSeats = async (req, res) => {
    try {
        console.log('🌱 Manual Seed Triggered for ALL Shows...');
        let totalCreated = 0;
        let showsFixed = 0;
        const allShows = await (0, db_1.query)('SELECT * FROM shows');
        for (const show of allShows.rows) {
            const seats = await (0, db_1.query)('SELECT count(*) FROM seats WHERE show_id = $1', [show.id]);
            if (parseInt(seats.rows[0].count) > 0)
                continue; // Skip if already has seats
            showsFixed++;
            const sId = show.id;
            const type = show.type;
            const totalSeats = show.total_seats || 50; // Fallback
            if (type === 'SHOW') {
                const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                for (let r = 0; r < rows.length; r++) {
                    for (let i = 1; i <= 10; i++) {
                        if (r * 10 + i > totalSeats)
                            break;
                        await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `${rows[r]}${i}`]);
                        totalCreated++;
                    }
                }
            }
            else if (type === 'BUS') {
                const count = totalSeats / 2;
                for (let i = 1; i <= count; i++) {
                    await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `L${i}`]);
                    await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, `R${i}`]);
                    totalCreated++;
                }
            }
            else if (type === 'DOCTOR') {
                for (let i = 0; i < totalSeats; i++) {
                    const hour = 9 + i;
                    const label = `${hour}:00`;
                    await (0, db_1.query)(`INSERT INTO seats (show_id, label, status) VALUES ($1, $2, 'AVAILABLE')`, [sId, label]);
                    totalCreated++;
                }
            }
        }
        res.json({ message: 'Seeding attempt complete', showsFixed, seatsCreated: totalCreated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.forceSeedSeats = forceSeedSeats;
