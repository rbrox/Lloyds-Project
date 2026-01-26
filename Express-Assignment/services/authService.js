import { User } from '../models/index.js';

/**
 * Sign up a new user
 */
export const signup = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role
  });

  await user.save();
  
  // Return user without password
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Return user without password
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};
