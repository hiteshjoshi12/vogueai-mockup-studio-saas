const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokens: { type: Number, default: 3 } // Start users with 10 free credits
});

module.exports = mongoose.model('User', userSchema);