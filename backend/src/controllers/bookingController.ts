import { Request, Response } from 'express';
import * as bookingService from '../services/bookingService';
import Joi from 'joi';

const holdSchema = Joi.object({
    showId: Joi.number().required(),
    seatLabels: Joi.array().items(Joi.string()).min(1).required(),
    userId: Joi.string().required()
});

const confirmSchema = Joi.object({
    showId: Joi.number().required(),
    seatLabels: Joi.array().items(Joi.string()).min(1).required(),
    userId: Joi.string().required()
});

export const holdSeats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = holdSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const result = await bookingService.holdSeats(value.showId, value.seatLabels, value.userId);
        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(409).json({ error: err.message || 'Booking Conflict' });
    }
};

export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = confirmSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const result = await bookingService.confirmBooking(value.showId, value.seatLabels, value.userId);
        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(409).json({ error: err.message || 'Confirmation Failed' });
    }
};

export const resetBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const showId = parseInt(req.body.showId);
        if (!showId) {
            res.status(400).json({ error: 'Show ID required' });
            return;
        }
        await bookingService.resetShowBookings(showId);
        res.json({ message: 'All bookings reset for show.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
