import Joi from 'joi';

export const createSlotSchema = {
  body: Joi.object({
    startTime: Joi.date().iso().required().messages({
      'any.required': 'startTime is required',
      'date.base': 'startTime must be a valid ISO date string'
    }),
    endTime: Joi.date().iso().required().messages({
      'any.required': 'endTime is required',
      'date.base': 'endTime must be a valid ISO date string'
    }),
    capacity: Joi.number().integer().min(1).required().messages({
      'any.required': 'capacity is required',
      'number.base': 'capacity must be a number',
      'number.min': 'capacity must be at least 1'
    }),
    tags: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'tags must be an array of strings',
      'array.includes': 'tags must only contain strings'
    })
  })
};

export const getSlotsSchema = {
  query: Joi.object({
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    tags: Joi.string().optional(),
    availableOnly: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

export const updateSlotSchema = {
  body: Joi.object({
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    capacity: Joi.number().integer().min(1).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }).min(1)
};

export const bookSlotSchema = {
  body: Joi.object({
    slotId: Joi.string().required().messages({
      'any.required': 'slotId is required'
    })
  })
};

export const getMyBookingsSchema = {
  query: Joi.object({
    status: Joi.string().valid('BOOKED', 'CANCELLED').optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};
