require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate'); // Import new route

const app = express();

// Increase payload limit for Base64 images (Default is usually 1MB, we need more for images)
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Database connected'))
  .catch(err => console.error('🔴 Database error:', err));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes); // Register generation route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));