import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// TODO: Add Swagger documentation
// TODO: Add API Routes (users, slots, bookings)
// TODO: Add 404 handler
// TODO: Add global error handler

export default app;