import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import mongoose from 'mongoose';

/**
 * Book a slot (CANDIDATE only)
 */
export const bookSlot = async (slotId, candidateId) => {
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
  
  // Check if candidate already booked this slot
  const existingBooking = await Booking.findOne({
    slotId,
    candidateId,
    status: 'BOOKED'
  });
  
  if (existingBooking) {
    const error = new Error('You have already booked this slot');
    error.statusCode = 409;
    throw error;
  }
  
  // Check capacity
  const activeBookings = await Booking.countDocuments({
    slotId,
    status: 'BOOKED'
  });
  
  if (activeBookings >= slot.capacity) {
    const error = new Error('Slot is at full capacity');
    error.statusCode = 409;
    throw error;
  }
  
  const booking = new Booking({
    slotId,
    candidateId,
    status: 'BOOKED'
  });
  
  await booking.save();
  return booking.populate('slotId');
};

/**
 * Get candidate's bookings with optional filters
 */
export const getMyBookings = async (candidateId, query) => {
  const { status, from, to, page = 1, limit = 10 } = query;
  
  const filter = { candidateId };
  
  if (status) {
    filter.status = status;
  }
  
  if (from || to) {
    filter.$or = [];
    if (from) {
      filter.$or.push({ 
        'slotId.startTime': { $gte: new Date(from) } 
      });
    }
    if (to) {
      filter.$or.push({ 
        'slotId.endTime': { $lte: new Date(to) } 
      });
    }
  }
  
  const skip = (page - 1) * limit;
  const bookings = await Booking.find(filter)
    .populate('slotId')
    .skip(skip)
    .limit(limit)
    .sort({ bookedAt: -1 });
  
  const total = await Booking.countDocuments(filter);
  
  return {
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Cancel a booking (idempotent)
 */
export const cancelBooking = async (bookingId, candidateId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error('Invalid booking ID format');
    error.statusCode = 400;
    throw error;
  }
  
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check ownership
  if (booking.candidateId.toString() !== candidateId.toString()) {
    const error = new Error('Forbidden: You can only cancel your own bookings');
    error.statusCode = 403;
    throw error;
  }
  
  // Idempotent: if already cancelled, return success
  if (booking.status === 'CANCELLED') {
    return booking;
  }
  
  booking.status = 'CANCELLED';
  await booking.save();
  
  return booking.populate('slotId');
};
