const mongoose = require('mongoose');

const buyerSchema = mongoose.Schema(
    {
        name: {
            type: String,
        },
        mobile: {
            type: String,
        },
        creditPoints: {
            type: Number,
            default: 0
        },
        buyCount: {
            type: Number,
            default: 0
        },
        buyAmount: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
    }
);

const Buyer = mongoose.model('Buyer', buyerSchema, 'Buyer');
module.exports = Buyer;
