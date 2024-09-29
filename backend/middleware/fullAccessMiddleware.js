module.exports = function (req, res, next) {
    try {
      if (req.user && req.user.fullAccess) {
        return next();
      }
      return res.status(403).json({ error: 'Access denied. Full access is required.' });
    } catch (err) {
      console.error('Error in fullAccessMiddleware:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  