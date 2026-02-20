const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Create the user
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    // 3. Generate a secure JWT session token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // 4. Send back the auth token and SaaS data
    res.status(201).json({ token, email: user.email, tokens: user.tokens });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed. User might already exist.' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email, tokens: user.tokens });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;