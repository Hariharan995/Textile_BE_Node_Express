const joi = require('joi');
const { min } = require('moment');
const joiObjectId = require('joi-objectid')(joi)
const { CONSTANT_MSG } = require('../config/constant_messages');

module.exports.signUpSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().max(75).valid("mhariharanms@gmail.com"),
    mobile: joi.string().min(10),
    password: joi.string().min(6).max(30),
    userRole: joi.string().required().valid('SELLER'),
});

module.exports.signInSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(6).max(30).required(),
});

module.exports.signOutSchema = joi.object({
    token: joi.string().required()
});

module.exports.deleteUser = joi.object({
    userId: joi.string().required()
});

module.exports.getAllUsers = joi.object({
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    filterObj: joi.object({
        userRole: joi.string().valid("SELLER"),
        searchValue: joi.string(),
        userStatus: joi.string().valid("APPROVED", "UNAPPROVED"),
    }),
    sortObj: joi.object({
        createdAt: joi.number().valid(-1, 1),
        name: joi.number().valid(-1, 1)
    }).max(1)
})