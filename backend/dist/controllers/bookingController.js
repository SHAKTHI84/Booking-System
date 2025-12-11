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
exports.resetBookings = exports.confirmBooking = exports.holdSeats = void 0;
const bookingService = __importStar(require("../services/bookingService"));
const joi_1 = __importDefault(require("joi"));
const holdSchema = joi_1.default.object({
    showId: joi_1.default.number().required(),
    seatLabels: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    userId: joi_1.default.string().required()
});
const confirmSchema = joi_1.default.object({
    showId: joi_1.default.number().required(),
    seatLabels: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    userId: joi_1.default.string().required()
});
const holdSeats = async (req, res) => {
    try {
        const { error, value } = holdSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const result = await bookingService.holdSeats(value.showId, value.seatLabels, value.userId);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(409).json({ error: err.message || 'Booking Conflict' });
    }
};
exports.holdSeats = holdSeats;
const confirmBooking = async (req, res) => {
    try {
        const { error, value } = confirmSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const result = await bookingService.confirmBooking(value.showId, value.seatLabels, value.userId);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(409).json({ error: err.message || 'Confirmation Failed' });
    }
};
exports.confirmBooking = confirmBooking;
const resetBookings = async (req, res) => {
    try {
        const showId = parseInt(req.body.showId);
        if (!showId) {
            res.status(400).json({ error: 'Show ID required' });
            return;
        }
        await bookingService.resetShowBookings(showId);
        res.json({ message: 'All bookings reset for show.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.resetBookings = resetBookings;
