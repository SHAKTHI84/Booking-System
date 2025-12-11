"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const pg_mem_1 = require("pg-mem");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
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
    // Initialize Schema Immediately
    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
    db.public.query(schemaSql);
    // Seed Data Immediately for convenience
    // We import the seed logic effectively here or rely on the seed script to use this pool.
    // However, since seed script is a separate process usually, it won't share this memory.
    // SO WE MUST SEED HERE if mock.
    // Simple inline seeder for Mock to avoid circular deps with seed.ts (which imports this file)
    // Actually, we can just run the SQL inserts here.
    // ... We will rely on server.ts calling a seed function if mock.
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
exports.default = pool;
