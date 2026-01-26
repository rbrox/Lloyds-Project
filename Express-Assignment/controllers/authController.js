import * as authService from '../services/authService.js';

/**
 * Sign up a new user
 * POST /users/signup
 */
export const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /users/login
 */
export const login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
