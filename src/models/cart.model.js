const mongoose = require('mongoose');

const cartSchema = mongoose.Schema(
    {
        userId: {
            type: String,
        },
        productId: {
            type: Number,
        }
    },
    {
        timestamps: true,
    }
);

const cart = mongoose.model('Cart', cartSchema, 'Cart');
module.exports = cart;
