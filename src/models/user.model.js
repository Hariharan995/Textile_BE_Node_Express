const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
        },
        password: {
            type: String,
        },
        mobile: {
            type: String,
        },
        email: {
            type: String,
        },
        userRole: {
            type: Array,
        },
        userStatus: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean
        },
        isApproved: {
            type: Boolean
        },
        otp: {
            type: Number
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema, 'User');
module.exports = User;
