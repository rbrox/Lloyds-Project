import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import usersRouter from './routes/users.js';
import slotsRouter from './routes/slots.js';
import bookingsRouter from './routes/bookings.js';

// Load environment variables
dotenv.config();

console.log(process.env)

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/users', usersRouter);
app.use('/slots', slotsRouter);
app.use('/bookings', bookingsRouter);

// Global error handler (MUST come before 404 handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || []
  });
});

// 404 handler (MUST come last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [`Cannot ${req.method} ${req.path}`]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;