require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./lib/mongodb');

const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    console.log("✅ Database connected");
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);

// Root test route
app.get('/', (req, res) => res.send("VogueAI API is running..."));

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local server on port ${PORT}`));
}

// CRITICAL FOR VERCEL: Export the app
module.exports = app;