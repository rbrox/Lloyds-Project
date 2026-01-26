/**
 * Middleware to validate request data using Joi schemas
 * Supports validation of body, query, and params
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true // Remove unknown keys from validated data
    };

    // Validate body if schema has body validation
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }
      req.body = value; // Replace with validated/sanitized data
    }

    // Validate query parameters if schema has query validation
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }
      req.query = value;
    }

    // Validate URL parameters if schema has params validation
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }
      req.params = value;
    }

    next();
  };
};