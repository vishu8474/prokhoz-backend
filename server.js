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
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check - ADD THIS ROUTE AT ROOT LEVEL
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Prokhoz Backend Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Your existing health check
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
      console.log('❌ MONGODB_URI not found in environment variables');
      throw new Error('MongoDB URI not configured');
    }
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas Connected Successfully!');
    return true;
    
  } catch (error) {
    console.log('❌ MongoDB Atlas Connection Failed:', error.message);
    throw error;
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const inquiryRoutes = require('./routes/inquiries');
const contactRoutes = require('./routes/contact');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contact', contactRoutes);

// Your other routes...
app.get('/api/admin/users', async (req, res) => {
  // ... existing code
});

app.delete('/api/admin/reset-users', async (req, res) => {
  // ... existing code
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

const PORT = process.env.PORT || 3000;

// Start Server with better error handling
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/`);
      console.log(`🌐 CORS enabled for frontend development`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
