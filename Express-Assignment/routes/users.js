import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { signupSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

/**
 * POST /users/signup
 * Sign up a new user
 */
router.post('/signup', validate(signupSchema), authController.signup);

/**
 * POST /users/login
 * Login user
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
