const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes. Verifies the JWT token and attaches the authenticated user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (format: "Bearer <token_value>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database (excluding the password) and attach to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authorized, user not found'
        });
      }

      next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  // If no token is provided
  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };
