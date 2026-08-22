const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET;

const requireAuth = async (req, res, next) => {

  const authHeader = req.headers.authorization || '';

  // Bearer token support
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  if (!token) {

    return res.status(401).json({
      success: false,
      message: 'Authentication required - Authorization header missing'
    });

  }

  try {

    const decoded = jwt.verify(
      token,
      SECRET
    );

    const user = await User.findById(decoded.id).select('_id');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists. Please register again.'
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      'AUTH TOKEN ERROR:',
      error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });

  }

};

module.exports = requireAuth;