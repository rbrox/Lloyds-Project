import * as slotService from '../services/slotService.js';
import Slot from '../models/Slot.js';

/**
 * Create a new slot (ADMIN only)
 */
export const createSlot = async (req, res, next) => {
  try {
    // Only ADMINs can create slots
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only ADMINs can create slots',
        errors: ['Only ADMINs can create slots']
      });
    }

    const { startTime, endTime, capacity, tags } = req.body;

    // Check for overlapping slots for the same admin
    const overlap = await Slot.findOne({
      createdBy: req.user._id,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Slot overlaps with an existing slot',
        errors: ['Slot overlaps with an existing slot for this admin']
      });
    }

    const slot = new Slot({
      startTime,
      endTime,
      capacity,
      tags,
      createdBy: req.user._id
    });
    await slot.save();
    return res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: { slot }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all slots with filtering and pagination
 */
export const getSlots = async (req, res, next) => {
  try {
    const result = await slotService.getSlots(req.query);
    return res.status(200).json({
      success: true,
      message: 'Slots retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single slot by ID
 */
export const getSlot = async (req, res, next) => {
  try {
    const slot = await slotService.getSlot(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Slot retrieved successfully',
      data: { slot }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update slot (ADMIN only)
 */
export const updateSlot = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only ADMINs can update slots',
        errors: ['Only ADMINs can update slots']
      });
    }

    const slot = await slotService.updateSlot(req.params.id, req.body, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Slot updated successfully',
      data: { slot }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete slot (ADMIN only)
 */
export const deleteSlot = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only ADMINs can delete slots',
        errors: ['Only ADMINs can delete slots']
      });
    }

    await slotService.deleteSlot(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
