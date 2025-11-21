const User = require('../models/User');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log('🟡 UPDATE PROFILE - Request body:', req.body);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.body.companyName !== undefined) user.companyName = req.body.companyName;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.industry !== undefined) user.industry = req.body.industry;
        if (req.body.description !== undefined) user.description = req.body.description;
        if (req.body.website !== undefined) user.website = req.body.website;

        await user.save();

        res.json({ 
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                companyName: user.companyName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                industry: user.industry || '',
                description: user.description || '',
                website: user.website || '',
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Profile update failed', 
            error: error.message 
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully!'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Password update failed', 
            error: error.message 
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        await Product.deleteMany({ manufacturer: req.user.id });
        await Inquiry.deleteMany({ 
            $or: [
                { manufacturer: req.user.id },
                { buyer: req.user.id }
            ] 
        });

        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: 'Account deleted successfully!'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Account deletion failed', 
            error: error.message 
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    deleteAccount
};