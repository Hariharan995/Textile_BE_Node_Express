const mongoose = require('mongoose');

const cartSchema = mongoose.Schema(
    {
        userId: {
            type: String,
        },
        productId: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        barcodeId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const cart = mongoose.model('Cart', cartSchema, 'Cart');
module.exports = cart;
