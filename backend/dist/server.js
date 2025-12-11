"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
const api_1 = __importDefault(require("./routes/api"));
const db_1 = require("./db");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const seedInternal_1 = require("./db/seedInternal");
// Use Routes
app.use('/api', api_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs));
// Seed on startup if needed (esp for mock db)
(0, seedInternal_1.seedDataInternal)();
// Background Worker: Cleanup Expired Seats every 1 minute
setInterval(async () => {
    try {
        const result = await (0, db_1.query)(`UPDATE seats 
       SET status = 'AVAILABLE', user_id = NULL, expires_at = NULL 
       WHERE status = 'PENDING' AND expires_at < NOW()`);
        if (result && result.rowCount && result.rowCount > 0) {
            console.log(`[Cleanup] Released ${result.rowCount} expired seats.`);
        }
    }
    catch (err) {
        console.error('[Cleanup] Error releasing seats:', err);
    }
}, 60000);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
