const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(require('cors')());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err.message));

// Simple test routes
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Prokhoz Minimal Server Running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK',
        database: 'Connected',
        environment: process.env.NODE_ENV
    });
});

// Test auth endpoint
app.post('/api/test-register', (req, res) => {
    const { companyName, email, role } = req.body;
    res.json({
        success: true,
        message: 'Test registration successful',
        user: { companyName, email, role, id: 'test-' + Date.now() }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Minimal server running on port ${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});