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

// Health check - works even without DB
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Prokhoz Backend Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected - Check MongoDB Whitelist',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB Atlas (with error handling)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('❌ MONGODB_URI not found');
      return false;
    }
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas Connected Successfully!');
    return true;
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed - IP not whitelisted');
    console.log('💡 Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0');
    // Don't throw error - let server start without DB
    return false;
  }
};

// Import and use routes (they'll fail gracefully if DB not connected)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const inquiryRoutes = require('./routes/inquiries');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contact', contactRoutes);

// Other routes...

const PORT = process.env.PORT || 3000;

// Start Server
const startServer = async () => {
  await connectDB(); // Try to connect, but don't fail if it doesn't
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Access your app: https://prokhoz-backend-production.up.railway.app/`);
  });
};

startServer();
