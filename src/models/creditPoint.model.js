const mongoose = require('mongoose');

const creditPointSchema = mongoose.Schema(
    {
        point: {
            type: String,
        },
        amount: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const CreditPoint = mongoose.model('CreditPoint', creditPointSchema, 'CreditPoint');
module.exports = CreditPoint;
