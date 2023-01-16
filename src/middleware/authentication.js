const jwt = require('jsonwebtoken');
const { Token } = require('../models')
require('dotenv').config()
const { CONSTANT_MSG } = require('../config/constant_messages');
const ObjectID = require('mongodb').ObjectId;

module.exports.checkJwtToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ statuCode: 401, message: CONSTANT_MSG.ERROR_MSG.UNAUTHORIZED_NO_PERMISSION_ERROR });
    }
    const token = authHeader.split(' ')[1]
    if (token) {
        const userTokenValid = await Token.findOne({ token: token });
        if (!userTokenValid) {
            return res.status(401).send({ statuCode: 401, message: CONSTANT_MSG.ERROR_MSG.UNAUTHORIZED_NO_PERMISSION_ERROR, data: { isLogout: true } });
        }
        jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(401).send({ statuCode: 401, message: err.message, data: { isTokenExpired: true } });
            } else {
                req.user = user;
                next();
            }
        });
    }
    else {
        return res.status(401).send({ statuCode: "401", message: "Invalid Request : Authentication Error" });
    }
};

module.exports.getJwtToken = async (req) => {
    const token = jwt.sign({ email: req.email, userRole: req.userRole, mobile: req.mobile, userId: req._id }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: "10d" })
    const Obj = {
        token: token,
        userId: req._id
    }
    const tokenSave = Token(Obj);
    await tokenSave.save();
    return token;
};

module.exports.getJwtTokenForMbl = async (req) => {
    const token = jwt.sign({ email: req.email, userRole: req.userRole, mobile: req.mobile, userId: req._id }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: "90d" })
    const Obj = {
        token: token,
        userId: req._id
    }
    const tokenSave = Token(Obj)
    await tokenSave.save()
    return token
};

module.exports.checkShipRocketToken = async (req, res, next) => {
    if (req.headers["x-api-key"] === process.env.SHIPROKCET_TOKEN) {
        next();
    }
    else {
        console.log("webhooks order update token..", req.headers["x-api-key"])
        return res.status(401).send({ statuCode: "401", message: CONSTANT_MSG.ERROR_MSG.UNAUTHORIZED_ERROR });
    }
}


module.exports.emailTokenCheck = async (req, res, next) => {
    const Token = req.query.token;
    if (Token) {
        jwt.verify(Token, process.env.JWT_TOKEN_SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(401).send({ statuCode: 401, message: err.message, data: { isTokenExpired: true } });
            } else {
                next();
            }
        });
    }
    else {
        return res.status(401).send({ statuCode: "401", message: "Invalid Request : Authentication Error" });
    }
}
