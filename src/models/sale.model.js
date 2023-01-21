const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
    {
        orderNo: {
            type: String,
        },
        totalAmount: {
            type: Number,
        },
        subTotal: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const sale = mongoose.model('Sale', saleSchema, 'Sale');
module.exports = sale;
