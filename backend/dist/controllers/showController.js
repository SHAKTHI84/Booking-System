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
exports.deleteShow = exports.getShow = exports.getShows = exports.createShow = void 0;
const showService = __importStar(require("../services/showService"));
const joi_1 = __importDefault(require("joi"));
const createShowSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    type: joi_1.default.string().valid('SHOW', 'BUS', 'DOCTOR').required(),
    start_time: joi_1.default.date().iso().required(),
    total_seats: joi_1.default.number().min(1).required(),
});
const createShow = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createShow = createShow;
const getShows = async (req, res) => {
    try {
        const shows = await showService.getAllShows();
        res.json(shows);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getShows = getShows;
const getShow = async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getShow = getShow;
const deleteShow = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        await showService.deleteShow(id);
        res.status(200).json({ message: 'Show deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteShow = deleteShow;
