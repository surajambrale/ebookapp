const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {

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