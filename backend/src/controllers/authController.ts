import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check existing
        const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role is USER
        const result = await query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'USER']
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Email or Password does not exist' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Email or Password does not exist' });
        }

        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        res.json({ user, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const checkStatus = async (req: Request, res: Response) => {
    try {
        const users = await query('SELECT count(*) FROM users');
        const admin = await query('SELECT * FROM users WHERE email = $1', ['ss0068@srmist.edu.in']);

        res.json({
            userCount: users.rows[0].count,
            adminExists: admin.rows.length > 0,
            adminEmail: admin.rows.length > 0 ? admin.rows[0].email : null
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
};
