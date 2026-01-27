import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { validate } from '../middlewares/validate.js';
import { bookSlotSchema, getMyBookingsSchema } from '../validators/slotValidator.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Book a slot (CANDIDATE only)
 *     tags:
 *       - Bookings
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *             properties:
 *               slotId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Slot booked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Duplicate booking or capacity exceeded
 */
router.post('/', authenticate, validate(bookSlotSchema), bookingController.bookSlot);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get my bookings (CANDIDATE only)
 *     tags:
 *       - Bookings
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [BOOKED, CANCELLED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/my', authenticate, validate(getMyBookingsSchema), bookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking (CANDIDATE only)
 *     tags:
 *       - Bookings
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.post('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;
