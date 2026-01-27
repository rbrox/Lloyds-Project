import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

/**
 * Get slots with filtering and pagination
 */
export const getSlots = async (query) => {
  const { from, to, tags, availableOnly, page = 1, limit = 10 } = query;
  
  const filter = {};
  
  if (from || to) {
    filter.$or = [];
    if (from) filter.$or.push({ endTime: { $gte: new Date(from) } });
    if (to) filter.$or.push({ startTime: { $lte: new Date(to) } });
  }
  
  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim());
    filter.tags = { $in: tagArray };
  }
  
  const skip = (page - 1) * limit;
  const slots = await Slot.find(filter).skip(skip).limit(limit);
  
  // Add availableSeats to each slot
  const slotsWithAvailable = await Promise.all(
    slots.map(async (slot) => {
      const activeBookings = await Booking.countDocuments({
        slotId: slot._id,
        status: 'BOOKED'
      });
      const availableSeats = slot.capacity - activeBookings;
      
      if (availableOnly && availableSeats <= 0) return null;
      
      return {
        ...slot.toObject(),
        availableSeats,
        activeBookings
      };
    })
  );
  
  const filtered = slotsWithAvailable.filter(s => s !== null);
  const total = await Slot.countDocuments(filter);
  
  return {
    data: filtered,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single slot by ID
 */
export const getSlot = async (slotId) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    const error = new Error('Invalid slot ID format');
    error.statusCode = 400;
    throw error;
  }
  
  const slot = await Slot.findById(slotId);
  if (!slot) {
    const error = new Error('Slot not found');
    error.statusCode = 404;
    throw error;
  }
  
  const activeBookings = await Booking.countDocuments({
    slotId,
    status: 'BOOKED'
  });
  
  return {
    ...slot.toObject(),
    availableSeats: slot.capacity - activeBookings,
    activeBookings
  };
};

/**
 * Update slot (ADMIN only)
 */
export const updateSlot = async (slotId, updates, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    const error = new Error('Invalid slot ID format');
    error.statusCode = 400;
    throw error;
  }
  
  const slot = await Slot.findById(slotId);
  if (!slot) {
    const error = new Error('Slot not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if admin owns this slot
  if (slot.createdBy.toString() !== adminId.toString()) {
    const error = new Error('Forbidden: You can only update your own slots');
    error.statusCode = 403;
    throw error;
  }
  
  // Validate time ranges if updating
  const startTime = updates.startTime || slot.startTime;
  const endTime = updates.endTime || slot.endTime;
  
  if (startTime >= endTime) {
    const error = new Error('Start time must be before end time');
    error.statusCode = 400;
    throw error;
  }
  
  // Check for overlaps if time is being updated
  if (updates.startTime || updates.endTime) {
    const overlap = await Slot.findOne({
      _id: { $ne: slotId },
      createdBy: adminId,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (overlap) {
      const error = new Error('Slot overlaps with an existing slot');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // Check capacity reduction
  if (updates.capacity && updates.capacity < slot.capacity) {
    const activeBookings = await Booking.countDocuments({
      slotId,
      status: 'BOOKED'
    });
    if (updates.capacity < activeBookings) {
      const error = new Error(`Cannot reduce capacity below ${activeBookings} active bookings`);
      error.statusCode = 409;
      throw error;
    }
  }
  
  Object.assign(slot, updates);
  await slot.save();
  
  return slot;
};

/**
 * Delete slot (ADMIN only)
 * Hard reject if bookings exist
 */
export const deleteSlot = async (slotId, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    const error = new Error('Invalid slot ID format');
    error.statusCode = 400;
    throw error;
  }
  
  const slot = await Slot.findById(slotId);
  if (!slot) {
    const error = new Error('Slot not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if admin owns this slot
  if (slot.createdBy.toString() !== adminId.toString()) {
    const error = new Error('Forbidden: You can only delete your own slots');
    error.statusCode = 403;
    throw error;
  }
  
  // Check if bookings exist
  const bookingCount = await Booking.countDocuments({ slotId });
  if (bookingCount > 0) {
    const error = new Error('Cannot delete slot with existing bookings');
    error.statusCode = 409;
    throw error;
  }
  
  await Slot.findByIdAndDelete(slotId);
};
