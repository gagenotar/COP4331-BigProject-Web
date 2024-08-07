const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
        userId: user._id,
        login: user.login
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: '3m' }
  );
  const refreshToken = jwt.sign(
    { 
        userId: user._id,
        login: user.login
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
