const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {

  console.log('================ AUTH DEBUG ================');

  console.log('JWT_SECRET EXISTS:', !!SECRET);

  console.log(
    'AUTHORIZATION HEADER:',
    req.headers.authorization
  );

  const authHeader = req.headers.authorization || '';

  if (!authHeader) {

    console.log('❌ NO AUTHORIZATION HEADER');

    return res.status(401).json({
      success: false,
      message: 'Authentication required - Authorization header missing'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  console.log(
    'TOKEN EXISTS:',
    !!token
  );

  console.log(
    'TOKEN LENGTH:',
    token?.length
  );

  if (!token) {

    console.log('❌ TOKEN EMPTY');

    return res.status(401).json({
      success: false,
      message: 'Authentication required - token missing'
    });
  }

  try {

    const decoded = jwt.verify(
      token,
      SECRET
    );

    console.log(
      '✅ JWT VERIFIED:',
      decoded
    );

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      '❌ JWT VERIFY ERROR:',
      error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

module.exports = requireAuth;