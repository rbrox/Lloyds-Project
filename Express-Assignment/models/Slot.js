import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Capacity must be an integer'
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags) {
          // Ensure all tags are strings and not empty
          return tags.every(tag => typeof tag === 'string' && tag.trim().length > 0);
        },
        message: 'All tags must be non-empty strings'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Validate that startTime is before endTime
slotSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    next(new Error('Start time must be before end time'));
  } else {
    next();
  }
});

// Also validate on update
slotSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const $set = update.$set || update;
  
  if ($set.startTime && $set.endTime) {
    if (new Date($set.startTime) >= new Date($set.endTime)) {
      return next(new Error('Start time must be before end time'));
    }
  }
  next();
});

// Index for finding slots by admin
slotSchema.index({ createdBy: 1 });

// Index for time-based queries
slotSchema.index({ startTime: 1, endTime: 1 });

// Compound index for admin's slots ordered by time
slotSchema.index({ createdBy: 1, startTime: 1 });

// Index for tag-based searches
slotSchema.index({ tags: 1 });

// Text index for tag searches (optional, for full-text search)
slotSchema.index({ tags: 'text' });

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;