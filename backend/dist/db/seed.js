"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importStar(require("./index"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const seedSchema = async () => {
    try {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
        await (0, index_1.query)(schemaSql);
        console.log('Schema created successfully.');
    }
    catch (err) {
        console.error('Error creating schema:', err);
        throw err;
    }
};
const seedData = async () => {
    try {
        // specific check to avoid duplicate seeding
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
        `, ['Avengers: Secret Wars', 'SHOW', new Date(Date.now() + 86400000).toISOString(), 50]); // Tomorrow
        const showId = showRes.rows[0].id;
        // Create 50 seats (A1-A10, B1-B10... E1-E10)
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
        `, ['Bangalore to Goa (Sleeper)', 'BUS', new Date(Date.now() + 172800000).toISOString(), 30]); // Day after tomorrow
        const busId = busRes.rows[0].id;
        // Create 30 seats
        const busRows = ['L', 'R']; // Left, Right
        for (let i = 1; i <= 15; i++) {
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `L${i}`, 'AVAILABLE']);
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [busId, `R${i}`, 'AVAILABLE']);
        }
        // 3. Create Doctor Appointment Slots (Treated as seats)
        const docRes = await (0, index_1.query)(`
            INSERT INTO shows (name, type, start_time, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Dr. Strange (Cardiologist)', 'DOCTOR', new Date(Date.now() + 259200000).toISOString(), 10]);
        const docId = docRes.rows[0].id;
        // Create 10 slots (times)
        for (let i = 9; i < 19; i++) {
            await (0, index_1.query)('INSERT INTO seats (show_id, label, status) VALUES ($1, $2, $3)', [docId, `${i}:00`, 'AVAILABLE']);
        }
        console.log('Seeding complete.');
    }
    catch (err) {
        console.error('Error seeding data:', err);
    }
};
const run = async () => {
    await seedSchema();
    await seedData();
    index_1.default.end();
};
run();
