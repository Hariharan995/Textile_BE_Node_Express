const mongoose = require('mongoose');

const creditPointSchema = mongoose.Schema(
    {
        point: {
            type: Number,
        },
        amount: {
            type: Number,
        },
        applyPercent: {
            type: Number,
        }
    },
    {
        timestamps: true,
    }
);

const CreditPoint = mongoose.model('CreditPoint', creditPointSchema, 'CreditPoint');
module.exports = CreditPoint;
