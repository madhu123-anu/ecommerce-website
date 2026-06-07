const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, path: '/api/auth/refresh-token' });

  // Remove sensitive fields
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.verificationToken;
  delete userObj.resetPasswordToken;

  res.status(statusCode).json({
    success: true,
    message,
    token: accessToken,
    accessToken,
    refreshToken,
    user: userObj,
  });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
