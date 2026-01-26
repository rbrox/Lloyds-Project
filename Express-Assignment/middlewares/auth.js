import mongoose from 'mongoose';
import { User } from '../models/index.js';

/**
 * Authenticate user based on x-user-id header
 * Validates the user ID and fetches user from database
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get user ID from header
    const userId = req.headers['x-user-id'];

    // Check if header exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: ['x-user-id header is missing']
      });
    }

    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID format',
        errors: ['x-user-id must be a valid MongoDB ObjectId']
      });
    }

    // Fetch user from database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        errors: ['No user exists with the provided ID']
      });
    }

    // Attach user to request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      errors: [error.message]
    });
  }
};

/**
 * Authorize only ADMIN role
 */
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      errors: ['This endpoint is only accessible to admins']
    });
  }
  next();
};

/**
 * Authorize only CANDIDATE role
 */
export const authorizeCandidate = (req, res, next) => {
  if (req.user.role !== 'CANDIDATE') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      errors: ['This endpoint is only accessible to candidates']
    });
  }
  next();
};

/**
 * Authorize both ADMIN and CANDIDATE (any authenticated user)
 * This is just for clarity - if you use only authenticate(), it allows both
 */
export const authorizeAny = (req, res, next) => {
  // User is already authenticated, both roles allowed
  next();
};