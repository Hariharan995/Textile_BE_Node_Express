const { sellerService } = require('../services');
const { addToCart, deleteSingleCart, delelteAllCart, orderPlaced } = require('../validator/validation')
const { CONSTANT_MSG } = require('../config/constant_messages');


exports.addToCart = async (req, res) => {
    try {
        await addToCart.validateAsync(req.body)
        const cart = await sellerService.addToCart(req);
        return res.status(cart.statusCode).send(cart)
    } catch (error) {
        console.log("Error in addToCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.deleteSingleCart = async (req, res) => {
    try {
        await deleteSingleCart.validateAsync(req.body)
        const userList = await sellerService.deleteSingleCart(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in deleteSingleCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.delelteAllCart = async (req, res) => {
    try {
        await delelteAllCart.validateAsync(req.body)
        const userList = await sellerService.delelteAllCart(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in delelteAllCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getAllCarts = async (req, res) => {
    try {
        await getAllCarts.validateAsync(req.body)
        const userList = await sellerService.getAllCarts(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllCarts API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.orderPlaced = async (req, res) => {
    try {
        await orderPlaced.validateAsync(req.body)
        const userList = await sellerService.orderPlaced(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in orderPlaced API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};