
const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  // Existing customer token - Lab 6
  genToken(username, password) {
    return jwt.sign(
      { username: username, password: password },
      MyConstants.JWT_SECRET,
      { expiresIn: MyConstants.JWT_EXPIRES }
    );
  },

  // Existing token verification
  checkToken(req, res, next) {
    const token =
      req.headers['x-access-token'] ||
      req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }

    jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      }

      req.decoded = decoded;
      next();
    });
  },

  // Lab 9 - Generate Admin token
  genAdminToken(adminId) {
    return jwt.sign(
      {
        adminId: String(adminId),
        role: 'admin'
      },
      MyConstants.JWT_SECRET,
      { expiresIn: MyConstants.JWT_EXPIRES }
    );
  },

  // Lab 9 - Verify Admin token
  checkAdminToken(req, res, next) {
    const token =
      req.headers['x-access-token'] ||
      req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }

    jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      }

      if (
        decoded.role !== 'admin' ||
        !decoded.adminId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      req.decoded = decoded;
      next();
    });
  }
};

module.exports = JwtUtil;
