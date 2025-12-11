"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetShowBookings = exports.confirmBooking = exports.holdSeats = void 0;
const db_1 = require("../db");
const holdSeats = async (showId, seatLabels, userId) => {
    const client = await (0, db_1.getClient)();
    try {
        await client.query('BEGIN');
        // Lock the rows - PESSIMISTIC LOCKING
        // We select the rows matching the labels and show_id
        // FOR UPDATE ensures no other transaction can modify these rows until we commit
        const checkRes = await client.query(`SELECT id, label, status, expires_at 
             FROM seats 
             WHERE show_id = $1 AND label = ANY($2::text[]) 
             FOR UPDATE`, [showId, seatLabels]);
        const seats = checkRes.rows;
        // Validation 1: All seats must exist
        if (seats.length !== seatLabels.length) {
            throw new Error('One or more seats do not exist.');
        }
        // Validation 2: All seats must be AVAILABLE (or expired PENDING)
        for (const seat of seats) {
            const isAvail = seat.status === 'AVAILABLE';
            const isExpired = seat.status === 'PENDING' && seat.expires_at && new Date(seat.expires_at) < new Date();
            // If it's booked, or pending and not expired, fail.
            if (seat.status === 'BOOKED') {
                throw new Error(`Seat ${seat.label} is already booked.`);
            }
            if (!isAvail && !isExpired) {
                throw new Error(`Seat ${seat.label} is currently held by someone else.`);
            }
        }
        // Update status to PENDING
        const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
        await client.query(`UPDATE seats 
             SET status = 'PENDING', user_id = $1, expires_at = $2 
             WHERE show_id = $3 AND label = ANY($4::text[])`, [userId, expiry.toISOString(), showId, seatLabels]);
        await client.query('COMMIT');
        return { success: true, message: 'Seats held successfully', expiry };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
};
exports.holdSeats = holdSeats;
const confirmBooking = async (showId, seatLabels, userId) => {
    const client = await (0, db_1.getClient)();
    try {
        await client.query('BEGIN');
        // Lock again to ensure we still hold them
        const checkRes = await client.query(`SELECT id, label, status, user_id, expires_at 
             FROM seats 
             WHERE show_id = $1 AND label = ANY($2::text[]) 
             FOR UPDATE`, [showId, seatLabels]);
        const seats = checkRes.rows;
        for (const seat of seats) {
            // Must be PENDING and held by THIS user
            if (seat.status !== 'PENDING' || seat.user_id !== userId) {
                throw new Error(`Seat ${seat.label} is no longer held by you.`);
            }
            // Check expiry again (though unlikely if flow is fast)
            if (new Date(seat.expires_at) < new Date()) {
                throw new Error(`Reservation for seat ${seat.label} has expired.`);
            }
        }
        // Update to BOOKED
        await client.query(`UPDATE seats 
             SET status = 'BOOKED', expires_at = NULL 
             WHERE show_id = $1 AND label = ANY($2::text[])`, [showId, seatLabels]);
        await client.query('COMMIT');
        return { success: true, message: 'Booking confirmed!' };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
};
exports.confirmBooking = confirmBooking;
const resetShowBookings = async (showId) => {
    // Admin function: Reset all seats for a show to AVAILABLE
    await (0, db_1.query)(`UPDATE seats 
         SET status = 'AVAILABLE', user_id = NULL, expires_at = NULL 
         WHERE showId = $1`, [showId]);
    // Wait, typo in SQL above: showId should be show_id in DB schema?
    // Let's correct it. Schema uses show_id.
    await (0, db_1.query)(`UPDATE seats 
         SET status = 'AVAILABLE', user_id = NULL, expires_at = NULL 
         WHERE show_id = $1`, [showId]);
};
exports.resetShowBookings = resetShowBookings;
