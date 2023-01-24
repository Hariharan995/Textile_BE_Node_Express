const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
    {
        orderNo: {
            type: String,
        },
        sellerId: {
            type: String,
        },
        productList: {
            type: Array,
        },
        itemCount: {
            type: Number,
        },
        priceTotal: {
            type: Number,
        },
        mrpTotal: {
            type: Number,
        },
        subTotal: {
            type: Number,
        },
        totalAmount: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const sale = mongoose.model('Sale', saleSchema, 'Sale');
module.exports = sale;
