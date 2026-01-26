import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot ID is required']
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required']
    },
    status: {
      type: String,
      enum: {
        values: ['BOOKED', 'CANCELLED'],
        message: 'Status must be either BOOKED or CANCELLED'
      },
      default: 'BOOKED'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// CRITICAL: Compound unique index to prevent duplicate bookings
// A candidate can only book the same slot once
bookingSchema.index({ slotId: 1, candidateId: 1 }, { unique: true });

// Index for finding bookings by candidate
bookingSchema.index({ candidateId: 1 });

// Index for finding bookings by slot
bookingSchema.index({ slotId: 1 });

// Index for status-based queries
bookingSchema.index({ status: 1 });

// Compound index for candidate's bookings by status
bookingSchema.index({ candidateId: 1, status: 1 });

// Compound index for slot's active bookings (for capacity check)
bookingSchema.index({ slotId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;