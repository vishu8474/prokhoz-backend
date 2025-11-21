// backend/controllers/inquiryController.js
const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');

const getMyInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ manufacturer: req.user.id })
            .populate('product', 'title category price unit')
            .populate('buyer', 'companyName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: inquiries.length,
            inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getBuyerInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ buyer: req.user.id })
            .populate('product', 'title category price unit images')
            .populate('manufacturer', 'companyName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: inquiries.length,
            inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('product', 'title category price unit images')
            .populate('buyer', 'companyName email phone address')
            .populate('manufacturer', 'companyName email phone')
            .populate('responses.user', 'companyName role');

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        if (inquiry.manufacturer._id.toString() !== req.user.id && inquiry.buyer._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this inquiry'
            });
        }

        res.json({
            success: true,
            inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const createInquiry = async (req, res) => {
    try {
        const { productId, message, quantity, budget, deadline } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const inquiry = await Inquiry.create({
            product: productId,
            buyer: req.user.id,
            manufacturer: product.manufacturer,
            message,
            quantity,
            budget,
            deadline
        });

        const populatedInquiry = await Inquiry.findById(inquiry._id)
            .populate('product', 'title category')
            .populate('buyer', 'companyName')
            .populate('manufacturer', 'companyName');

        res.status(201).json({
            success: true,
            inquiry: populatedInquiry,
            message: 'Inquiry sent successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        if (inquiry.manufacturer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this inquiry'
            });
        }

        inquiry.status = status;
        await inquiry.save();

        const populatedInquiry = await Inquiry.findById(inquiry._id)
            .populate('product', 'title category')
            .populate('buyer', 'companyName');

        res.json({
            success: true,
            inquiry: populatedInquiry,
            message: 'Inquiry status updated successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const addResponse = async (req, res) => {
    try {
        const { message } = req.body;

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        if (inquiry.manufacturer.toString() !== req.user.id && inquiry.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this inquiry'
            });
        }

        inquiry.responses.push({
            user: req.user.id,
            message
        });

        if (inquiry.manufacturer.toString() === req.user.id && inquiry.status === 'pending') {
            inquiry.status = 'responded';
        } else if (inquiry.buyer.toString() === req.user.id && inquiry.status === 'responded') {
            inquiry.status = 'in_discussion';
        }

        await inquiry.save();

        const populatedInquiry = await Inquiry.findById(inquiry._id)
            .populate('product', 'title category')
            .populate('buyer', 'companyName')
            .populate('manufacturer', 'companyName')
            .populate('responses.user', 'companyName role');

        res.json({
            success: true,
            inquiry: populatedInquiry,
            message: 'Response added successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ manufacturer: req.user.id });
        const totalInquiries = await Inquiry.countDocuments({ manufacturer: req.user.id });
        
        const inquiriesByStatus = await Inquiry.aggregate([
            { $match: { manufacturer: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusCounts = {};
        inquiriesByStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        const recentInquiries = await Inquiry.find({ manufacturer: req.user.id })
            .populate('product', 'title')
            .populate('buyer', 'companyName')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalInquiries,
                pendingInquiries: statusCounts.pending || 0,
                respondedInquiries: statusCounts.responded || 0,
                inDiscussionInquiries: statusCounts.in_discussion || 0,
                acceptedInquiries: statusCounts.accepted || 0
            },
            recentInquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getMyInquiries,
    getBuyerInquiries,
    getInquiry,
    createInquiry,
    updateInquiryStatus,
    addResponse,
    getDashboardStats
};