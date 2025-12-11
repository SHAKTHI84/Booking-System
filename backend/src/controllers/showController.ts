import { Request, Response } from 'express';
import * as showService from '../services/showService';
import Joi from 'joi';

const createShowSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('SHOW', 'BUS', 'DOCTOR').required(),
    start_time: Joi.date().iso().required(),
    total_seats: Joi.number().min(1).required(),
});

export const createShow = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = createShowSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const show = await showService.createShow(value.name, value.type, value.start_time, value.total_seats);

        // TODO: Auto-generate seats based on total_seats if needed. 
        // For simplicity, we assume separate seat creation or generic logic here. 
        // We will just return the show for now.

        res.status(201).json(show);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getShows = async (req: Request, res: Response) => {
    try {
        const shows = await showService.getAllShows();
        res.json(shows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getShow = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        const show = await showService.getShowById(id);
        if (!show) {
            res.status(404).json({ error: 'Show not found' });
            return;
        }
        res.json(show);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteShow = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        await showService.deleteShow(id);
        res.status(200).json({ message: 'Show deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
