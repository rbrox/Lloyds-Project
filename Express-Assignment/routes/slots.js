import express from 'express';
import * as slotController from '../controllers/slotController.js';
import { validate } from '../middlewares/validate.js';
import { 
  createSlotSchema, 
  getSlotsSchema, 
  updateSlotSchema 
} from '../validators/slotValidator.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /slots/create:
 *   post:
 *     summary: Create a new slot (ADMIN only)
 *     tags:
 *       - Slots
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Slot overlap conflict
 */
router.post('/create', authenticate, validate(createSlotSchema), slotController.createSlot);

/**
 * @swagger
 * /slots:
 *   get:
 *     summary: Get all slots with filtering and pagination
 *     tags:
 *       - Slots
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
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
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: availableOnly
 *         schema:
 *           type: boolean
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
 *         description: Slots retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, validate(getSlotsSchema), slotController.getSlots);

/**
 * @swagger
 * /slots/{id}:
 *   get:
 *     summary: Get slot details by ID
 *     tags:
 *       - Slots
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
 *         description: Slot retrieved successfully
 *       400:
 *         description: Invalid slot ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 */
router.get('/:id', authenticate, slotController.getSlot);

/**
 * @swagger
 * /slots/{id}:
 *   patch:
 *     summary: Update slot (ADMIN only)
 *     tags:
 *       - Slots
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Overlap or capacity conflict
 */
router.patch('/:id', authenticate, validate(updateSlotSchema), slotController.updateSlot);

/**
 * @swagger
 * /slots/{id}:
 *   delete:
 *     summary: Delete slot (ADMIN only)
 *     tags:
 *       - Slots
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
 *         description: Slot deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Cannot delete slot with existing bookings
 */
router.delete('/:id', authenticate, slotController.deleteSlot);

export default router;
