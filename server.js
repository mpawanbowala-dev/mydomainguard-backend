require('dotenv').config();
const startEmailCron = require('./src/jobs/emailCron');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// ඔටෝමැටික් ඊමේල් යවන සිස්ටම් එක පටන් ගැනීම (Cron Job)
startEmailCron();

// Global Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/api/payments', require('./src/routes/paymentRoutes'));

// Route Mounts
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/domains', require('./src/routes/domainRoutes'));

// Root/Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Domain Expiry Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware for 404 (Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found - ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});