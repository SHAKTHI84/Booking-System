"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const pg_mem_1 = require("pg-mem");
dotenv_1.default.config();
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SHOW', 'BUS', 'DOCTOR')),
    start_time TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    label VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'BOOKED')),
    user_id VARCHAR(255),
    expires_at TIMESTAMP,
    UNIQUE(show_id, label)
);

CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
`;
let pool; // Type as any to accommodate pg-mem interface which mimics pg Pool
const isMock = process.env.USE_MOCK_DB === 'true' || false;
if (isMock) {
    console.log('⚠️  USING IN-MEMORY MOCK DATABASE (pg-mem) ⚠️');
    const db = (0, pg_mem_1.newDb)();
    // Register current_database function mock if needed or strict standard
    db.public.registerFunction({
        name: 'current_database',
        implementation: () => 'ticket_system',
    });
    const PgAdapter = db.adapters.createPg();
    pool = new PgAdapter.Pool();
    // Mock DB initializes immediately upon creation
    db.public.query(SCHEMA_SQL);
}
else {
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}
const query = (text, params) => pool.query(text, params);
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
const initializeDB = async () => {
    if (!isMock) {
        console.log('🔄 Connecting to Real Database...');
        try {
            await (0, exports.query)(SCHEMA_SQL);
            console.log('✅ Schema ensured.');
            // Check if seeded
            const res = await (0, exports.query)('SELECT count(*) FROM shows');
            if (parseInt(res.rows[0].count) === 0) {
                console.log('🌱 Database empty. Seeding defaults...');
                // We can insert minimal defaults here if needed, 
                // but for now let's just ensure the tables exist.
                // A full seed script is better, but this handles the "fresh deploy" case.
                await (0, exports.query)(`
                    INSERT INTO shows (name, type, start_time, total_seats) VALUES
                    ('Avengers: Secret Wars', 'SHOW', NOW() + INTERVAL '1 day', 50),
                    ('Bangalore to Goa (Sleeper)', 'BUS', NOW() + INTERVAL '2 days', 30),
                    ('Dr. Strange (Cardiologist)', 'DOCTOR', NOW() + INTERVAL '3 days', 10);
                 `);
                console.log('✅ Seed data inserted.');
            }
        }
        catch (err) {
            console.error('❌ Database Initialization Failed:', err);
        }
    }
    else {
        console.log('✅ Mock Database Ready (In-Memory)');
    }
};
exports.initializeDB = initializeDB;
exports.default = pool;
