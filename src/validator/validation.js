const joi = require('joi');
const { min } = require('moment');
const joiObjectId = require('joi-objectid')(joi)
const { CONSTANT_MSG } = require('../config/constant_messages');

module.exports.signUpSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().max(75),
    mobile: joi.string().min(10),
    countryCode: joi.string(),
    password: joi.string().min(6).max(30),
    userRole: joi.string().required().valid('BUYER', 'SELLER', 'CURATOR'),
    sellerType: joi.when('userRole', {
        is: joi.string().valid('SELLER'),
        then: joi.valid('BY_REGISTER', 'BUYER_TO_SELLER', 'BY_STATIC').required(),
        otherwise: joi.valid(null),
    }),
    referralCode: joi.string().min(4)
});

module.exports.signInSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(6).max(30).required(),
    isMobileApp: joi.boolean()
});

module.exports.signOutSchema = joi.object({
    token: joi.string().required()
});
