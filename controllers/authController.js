const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const register = async (req, res) => {
    try {
        console.log('🟡 REGISTER - Request body:', req.body);
        
        const { companyName, email, password, phone, address, role } = req.body;
        
        if (!companyName || !email || !password || !phone || !address || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const existingUser = await User.findOne({ email });
        console.log('🟡 Existing user:', existingUser);
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this email' 
            });
        }
        
        const user = await User.create({
            companyName,
            email,
            password,
            phone,
            address,
            role
        });
        
        console.log('🟢 User created successfully:', user._id);
        
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                companyName: user.companyName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                avatar: user.avatar,
                industry: user.industry || "",
                description: user.description || "",
                website: user.website || ""
            },
            message: 'Registration successful!'
        });
    } catch (error) {
        console.error('🔥 Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration', 
            error: error.message 
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('🟡 LOGIN - Request body:', req.body);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const user = await User.findOne({ email }).select('+password');
        console.log('🟡 User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }
        
        const isPasswordMatch = await user.comparePassword(password);
        console.log('🟡 Password match:', isPasswordMatch);
        
        if (!isPasswordMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }
        
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                companyName: user.companyName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                avatar: user.avatar,
                industry: user.industry || "",
                description: user.description || "",
                website: user.website || ""
            },
            message: 'Login successful!'
        });
    } catch (error) {
        console.error('🔥 Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login', 
            error: error.message 
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                companyName: user.companyName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                avatar: user.avatar,
                industry: user.industry || "",
                description: user.description || "",
                website: user.website || ""
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};