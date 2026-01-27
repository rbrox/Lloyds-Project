import * as bookingService from '../services/bookingService.js';

/**
 * Book a slot (CANDIDATE only)
 */
export const bookSlot = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'CANDIDATE') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only CANDIDATEs can book slots',
        errors: ['Only CANDIDATEs can book slots']
      });
    }

    const booking = await bookingService.bookSlot(req.body.slotId, req.user._id);
    return res.status(201).json({
      success: true,
      message: 'Slot booked successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my bookings (CANDIDATE only)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'CANDIDATE') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only CANDIDATEs can view their bookings',
        errors: ['Only CANDIDATEs can view their bookings']
      });
    }

    const result = await bookingService.getMyBookings(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a booking (CANDIDATE only)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'CANDIDATE') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only CANDIDATEs can cancel bookings',
        errors: ['Only CANDIDATEs can cancel bookings']
      });
    }

    const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};
