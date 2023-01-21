const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        productName: {
            type: String,
        },
        userId: {
            type: String,
        },
        mrp: {
            type: Number
        },
        price: {
            type: Number
        },
    },
    {
        timestamps: true,
    }
);

const product = mongoose.model('Product', productSchema, 'Product');
module.exports = product;
