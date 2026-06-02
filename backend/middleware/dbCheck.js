import mongoose from 'mongoose';

export const dbCheck = (req, res, next) => {
  // Allow health check endpoint without a database connection
  if (req.path === '/health') {
    return next();
  }

  // Check if Mongoose is connected (1 = connected)
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. The system is running in simulated database mode. Start MongoDB to activate live cloud/local DB operations.'
    });
  }

  next();
};
