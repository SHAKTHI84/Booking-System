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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const showController = __importStar(require("../controllers/showController"));
const bookingController = __importStar(require("../controllers/bookingController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Shows
router.get('/shows', showController.getShows); // Public
router.get('/shows/:id', showController.getShow); // Public
router.post('/shows', auth_1.authenticateToken, auth_1.requireAdmin, showController.createShow); // Admin
router.delete('/shows/:id', auth_1.authenticateToken, auth_1.requireAdmin, showController.deleteShow); // Admin
// Bookings
router.post('/bookings/hold', auth_1.authenticateToken, bookingController.holdSeats); // Auth User
router.post('/bookings/confirm', auth_1.authenticateToken, bookingController.confirmBooking); // Auth User
router.post('/bookings/reset', auth_1.authenticateToken, auth_1.requireAdmin, bookingController.resetBookings); // Admin
exports.default = router;
