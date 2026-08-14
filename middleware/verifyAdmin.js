const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.substring(7)
    : header;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access denied'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token'
    });
  }
};
