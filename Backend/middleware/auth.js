const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // Get token from the header (Format: "Bearer <token>")
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the userId to the request object so the next function can use it
    req.user = { id: decoded.userId };
    next(); // Pass control to the next function
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

module.exports = requireAuth;