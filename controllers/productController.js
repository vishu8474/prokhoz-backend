const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('manufacturer', 'companyName email phone');
        res.json({ 
            success: true, 
            count: products.length,
            products 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

const createProduct = async (req, res) => {
    try {
        req.body.manufacturer = req.user.id;
        const product = await Product.create(req.body);
        
        res.status(201).json({ 
            success: true, 
            product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ manufacturer: req.user.id });
        res.json({ 
            success: true, 
            count: products.length,
            products 
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
    getProducts,
    createProduct,
    getMyProducts
};