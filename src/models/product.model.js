const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        productName: {
            type: String,
        },
        description: {
            type: String,
        },
        brand: {
            type: String,
        },
        productImage: {
            type: String,
        },
        productUrlId: {
            type: String,
        },
        sellerId: {
            type: String,
        },
        mrp: {
            type: Number
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        taxPercent: {
            type: Number
        },
        barcodeId: {
            type: String,
        },
        gender: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const product = mongoose.model('Product', productSchema, 'Product');
module.exports = product;
