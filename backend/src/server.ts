import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', version: 'v1.5-emergency', timestamp: new Date() });
});

// Emergency Seed Route (Direct Mount to bypass router/api issues)
import { forceSeedSeats } from './controllers/debugController';
app.get('/emergency-fix', forceSeedSeats);

import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import debugRoutes from './routes/debug';
import { query, initializeDB } from './db';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { seedDataInternal } from './db/seedInternal';

// Use Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Move Debug to Root to avoid /api collisions
console.log('Mounting /debug routes...');
app.use('/debug', debugRoutes);

app.use('/api', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Background Worker: Cleanup Expired Seats every 1 minute
setInterval(async () => {
    try {
        const result = await query(
            `UPDATE seats 
       SET status = 'AVAILABLE', user_id = NULL, expires_at = NULL 
       WHERE status = 'PENDING' AND expires_at < $1`,
            [new Date()]
        );
        if (result && result.rowCount && result.rowCount > 0) {
            console.log(`[Cleanup] Released ${result.rowCount} expired seats.`);
        }
    } catch (err) {
        console.error('[Cleanup] Error releasing seats:', err);
    }
}, 60000);

const startServer = async () => {
    // Ensure DB is ready (Real DB: Create Tables / Seed; Mock DB: No-op)
    await initializeDB();

    // If Mock, we explicitly seed here (legacy/separate seed script)
    if (process.env.USE_MOCK_DB === 'true') {
        seedDataInternal();
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
