"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDataInternal = void 0;
const index_1 = require("./index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedDataInternal = async () => {
    try {
        // Check if data exists
        const res = await (0, index_1.query)('SELECT count(*) FROM shows');
        if (parseInt(res.rows[0].count) > 0) {
            console.log('Database already seeded. Skipping.');
            return;
        }
        console.log('Seeding dummy data...');
        // 1. Create a Movie Show
        const showRes = await (0, index_1.query)(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Avengers: Secret Wars', 'SHOW', new Date(Date.now() + 86400000).toISOString(), 50]);
        const showId = showRes.rows[0].id;
        // Create 50 seats
        const rows = ['A', 'B', 'C', 'D', 'E'];
        for (const row of rows) {
            for (let i = 1; i <= 10; i++) {
                await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [showId, `${row}${i}`, 'AVAILABLE']);
            }
        }
        // 2. Create a Bus Trip
        const busRes = await (0, index_1.query)(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Bangalore to Goa (Sleeper)', 'BUS', new Date(Date.now() + 172800000).toISOString(), 30]);
        const busId = busRes.rows[0].id;
        const busRows = ['L', 'R'];
        for (let i = 1; i <= 15; i++) {
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `L${i}`, 'AVAILABLE']);
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `R${i}`, 'AVAILABLE']);
        }
        // 3. Create Doctor Slots
        const docRes = await (0, index_1.query)(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Dr. Strange (Cardiologist)', 'DOCTOR', new Date(Date.now() + 259200000).toISOString(), 10]);
        const docId = docRes.rows[0].id;
        for (let i = 9; i < 19; i++) {
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [docId, `${i}:00`, 'AVAILABLE']);
        }
        console.log('Seeding complete.');
        // Seed Admin for Mock Mode
        const adminRes = await (0, index_1.query)('SELECT count(*) FROM users WHERE email = $1', ['ss0068@srmist.edu.in']);
        if (parseInt(adminRes.rows[0].count) === 0) {
            console.log('Seeding Mock Admin...');
            const hashedPassword = await bcryptjs_1.default.hash('Hello@2002', 10);
            await (0, index_1.query)('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Super Admin', 'ss0068@srmist.edu.in', hashedPassword, 'ADMIN']);
        }
    }
    catch (err) {
        console.error('Error seeding data:', err);
    }
};
exports.seedDataInternal = seedDataInternal;
