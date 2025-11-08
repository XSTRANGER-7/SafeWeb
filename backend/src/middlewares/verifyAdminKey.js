// backend/src/middlewares/verifyAdminKey.js
module.exports = function verifyAdminKey(req, res, next) {
    const key = req.header('x-admin-key') || req.query.adminKey;
    if (!key || key !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized - invalid admin key' });
    }
    next();
  };
  