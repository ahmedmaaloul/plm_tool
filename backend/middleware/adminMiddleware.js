// middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.fullAccess) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  };
  
  module.exports = adminMiddleware;
  