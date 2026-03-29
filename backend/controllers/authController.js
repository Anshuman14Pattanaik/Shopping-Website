const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, country, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !country || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      country,
      password
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({
          firstName,
          lastName,
          email,
          googleId,
          profilePicture,
          password: 'oauth-no-password',
          phone: '',
          country: ''
        });
        await user.save();
      } else {
        user.googleId = googleId;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Token
exports.verifyToken = (req, res) => {
  res.json({ valid: true, userId: req.userId });
};