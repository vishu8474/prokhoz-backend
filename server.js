// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:5174',
    /\.vercel\.app$/  // ALLOWS ALL VERCEL DEPLOYMENTS
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB Atlas' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('❌ MONGODB_URI not found in .env file');
      return;
    }
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
  } catch (error) {
    console.log('❌ MongoDB Atlas Connection Failed:', error.message);
    console.log('💡 Check your MONGODB_URI in .env file');
    console.log('💡 Make sure your IP is whitelisted in MongoDB Atlas');
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const inquiryRoutes = require('./routes/inquiries');
// In your server.js or app.js
const contactRoutes = require('./routes/contact');
app.use('/api', contactRoutes);
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
// Add this to your server.js before the 404 handler

// Get all users (for admin purposes)
app.get('/api/admin/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-password'); // Exclude passwords
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Delete all users (reset database)
app.delete('/api/admin/reset-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Inquiry = require('./models/Inquiry');
    
    // Delete all data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Inquiry.deleteMany({});
    
    res.json({
      success: true,
      message: 'Database reset successfully! All users, products, and inquiries deleted.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message
    });
  }
});
// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 8080;

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for frontend development`);
  
  // Connect to MongoDB Atlas
  await connectDB();
});
