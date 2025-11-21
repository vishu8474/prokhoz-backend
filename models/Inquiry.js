const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    manufacturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    quantity: {
        type: Number,
        required: true
    },
    budget: {
        type: Number
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'in_discussion', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    responses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

inquirySchema.index({ manufacturer: 1, status: 1 });
inquirySchema.index({ buyer: 1 });
inquirySchema.index({ product: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);