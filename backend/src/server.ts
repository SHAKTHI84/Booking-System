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

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

import apiRoutes from './routes/api';
import { query } from './db';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { seedDataInternal } from './db/seedInternal';

// Use Routes
app.use('/api', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Seed on startup if needed (esp for mock db)
seedDataInternal();

// Background Worker: Cleanup Expired Seats every 1 minute
setInterval(async () => {
    try {
        const result = await query(
            `UPDATE seats 
       SET status = 'AVAILABLE', user_id = NULL, expires_at = NULL 
       WHERE status = 'PENDING' AND expires_at < NOW()`
        );
        if (result && result.rowCount && result.rowCount > 0) {
            console.log(`[Cleanup] Released ${result.rowCount} expired seats.`);
        }
    } catch (err) {
        console.error('[Cleanup] Error releasing seats:', err);
    }
}, 60000);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
