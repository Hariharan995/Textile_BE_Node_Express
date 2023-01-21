const { sellerService } = require('../services');
const { addProduct, updateProduct, deleteProduct, getProductById, addToCart, deleteSingleCart, delelteAllCart, getAllCarts, orderPlaced } = require('../validator/validation')
const { CONSTANT_MSG } = require('../config/constant_messages');


exports.addProduct = async (req, res) => {
    try {
        await addProduct.validateAsync(req.body)
        const product = await sellerService.addProduct(req.body);
        return res.status(product.statusCode).send(product)
    } catch (error) {
        console.log("Error in addProduct API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        await updateProduct.validateAsync(req.body)
        const product = await sellerService.updateProduct(req.body);
        return res.status(product.statusCode).send(product)
    } catch (error) {
        console.log("Error in updateProduct API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await deleteProduct.validateAsync(req.query)
        const product = await sellerService.deleteProduct(req.query);
        return res.status(product.statusCode).send(product)
    } catch (error) {
        console.log("Error in deleteProduct API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        await getProductById.validateAsync(req.query)
        const product = await sellerService.getProductById(req.query);
        return res.status(product.statusCode).send(product)
    } catch (error) {
        console.log("Error in getProductById API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        await addToCart.validateAsync(req.body)
        const cart = await sellerService.addToCart(req.body);
        return res.status(cart.statusCode).send(cart)
    } catch (error) {
        console.log("Error in addToCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.deleteSingleCart = async (req, res) => {
    try {
        await deleteSingleCart.validateAsync(req.query)
        const userList = await sellerService.deleteSingleCart(req.query);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in deleteSingleCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.delelteAllCart = async (req, res) => {
    try {
        await delelteAllCart.validateAsync(req.query)
        const userList = await sellerService.delelteAllCart(req.query);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in delelteAllCart API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getAllCarts = async (req, res) => {
    try {
        await getAllCarts.validateAsync(req.query)
        const userList = await sellerService.getAllCarts(req.query);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllCarts API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.orderPlaced = async (req, res) => {
    try {
        await orderPlaced.validateAsync(req.body)
        const userList = await sellerService.orderPlaced(req.body);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in orderPlaced API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};