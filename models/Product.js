const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a product title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity']
    },
    unit: {
        type: String,
        required: [true, 'Please add unit (kg, pieces, etc)']
    },
    images: [{
        url: String,
        public_id: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    manufacturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'out-of-stock', 'discontinued'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);