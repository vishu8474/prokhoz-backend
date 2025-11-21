const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    role: {
        type: String,
        enum: ['manufacturer', 'buyer'],
        required: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    industry: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    businessType: {
        type: String,
        default: ''
    },
    companySize: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);