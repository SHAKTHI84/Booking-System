"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStatus = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        // Check existing
        const existing = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Default role is USER
        const result = await (0, db_1.query)('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', [name, email, hashedPassword, 'USER']);
        const user = result.rows[0];
        const token = (0, auth_1.generateToken)(user);
        res.status(201).json({ user, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user);
        // Remove password from response
        delete user.password;
        res.json({ user, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
const checkStatus = async (req, res) => {
    try {
        const users = await (0, db_1.query)('SELECT count(*) FROM users');
        const admin = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', ['ss0068@srmist.edu.in']);
        res.json({
            userCount: users.rows[0].count,
            adminExists: admin.rows.length > 0,
            adminEmail: admin.rows.length > 0 ? admin.rows[0].email : null
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
};
exports.checkStatus = checkStatus;
