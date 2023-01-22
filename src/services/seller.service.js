const { CONSTANT_MSG } = require('../config/constant_messages');
const { Product, Cart, Sale } = require('../models');
const ObjectID = require('mongodb').ObjectId;

exports.addProduct = async (reqBody) => {
    try {
        const product = await Product.findOne({ $or: [{ barcodeId: reqBody.barcodeId }] })
        if (product) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.PRODUCT.PRODUCT_EXISTING
            };
        }
        if (reqBody.productName) {
            reqBody.productName = reqBody.productName.trim()
            reqBody.productUrlId = (reqBody.productName).toString().trim().replaceAll(" ", '-')
            reqBody.productUrlId = (reqBody.productUrlId).replace(/[^a-zA-Z-0-9]/g, "-")
            reqBody.productUrlId = (reqBody.productUrlId).replaceAll("---", "-")
            reqBody.productUrlId = (reqBody.productUrlId).toLowerCase();
        }
        let products = new Product(reqBody)
        await products.save()
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.PRODUCT.PRODUCT_ADDED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.updateProduct = async (reqBody) => {
    try {
        const product = await Product.findOne({ _id: ObjectID(reqBody.productId) })
        if (!product) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.PRODUCT.PRODUCT_NOT_DETAILS
            };
        }
        if (reqBody.productName) {
            reqBody.productName = reqBody.productName.trim()
            reqBody.productUrlId = (reqBody.productName).toString().trim().replaceAll(" ", '-')
            reqBody.productUrlId = (reqBody.productUrlId).replace(/[^a-zA-Z-0-9]/g, "-")
            reqBody.productUrlId = (reqBody.productUrlId).replaceAll("---", "-")
            reqBody.productUrlId = (reqBody.productUrlId).toLowerCase();
        }
        await Product.updateOne({ _id: ObjectID(reqBody.productId) }, reqBody)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.PRODUCT.PRODUCT_UPDATED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.deleteProduct = async (reqBody) => {
    try {
        const product = await Product.findOne({ _id: ObjectID(reqBody.productId) })
        if (!product) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.PRODUCT.PRODUCT_NOT_DETAILS
            };
        }
        await Product.deleteOne({ _id: ObjectID(reqBody.productId) })
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.PRODUCT.PRODUCT_REMOVED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getProductById = async (reqBody) => {
    try {
        const product = await Product.findOne({ _id: ObjectID(reqBody.productId) })
        if (!product) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.PRODUCT.PRODUCT_NOT_DETAILS
            };
        }
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.PRODUCT.PRODUCT_DETAILS,
            data: product
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.addToCart = async (reqBody) => {
    try {
        const product = await Product.findOne({ barcodeId: reqBody.barcodeId })
        if (!product) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.PRODUCT.PRODUCT_NOT_DETAILS
            };
        }
        const cart = await Cart.findOne({ userId: reqBody.userId, barcodeId: reqBody.barcodeId })
        if (cart) {
            let quantityChange = reqBody.type === 'DECREASE' ? -1 : 1
            await Cart.updateOne({ userId: reqBody.userId, barcodeId: reqBody.barcodeId }, { $inc: { quantity: quantityChange } })
            return {
                statusCode: 200,
                status: CONSTANT_MSG.STATUS.SUCCESS,
                message: CONSTANT_MSG.CART.UPDATED_CART_SUCCESSFULLY,
            };
        }
        else {
            reqBody.quantity = 1
            let carts = new Cart(reqBody)
            await carts.save()
            return {
                statusCode: 200,
                status: CONSTANT_MSG.STATUS.SUCCESS,
                message: CONSTANT_MSG.CART.ADDED_CART_SUCCESSFULLY
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.deleteSingleCart = async (reqBody) => {
    try {
        const cart = await Cart.findOne({ _id: ObjectID(reqBody.cartId) })
        if (!cart) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.CART.CART_NOT_FOUND
            };
        }
        else {
            await Cart.deleteOne({ _id: ObjectID(reqBody.cartId) })
            return {
                statusCode: 200,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.CART.CART_REMOVED
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.delelteAllCart = async (reqBody) => {
    try {
        await Cart.deleteMany({ userId: reqBody.userId })
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.CART.CART_REMOVED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getAllCarts = async (reqBody) => {
    try {
        const cart = await Cart.aggregate([
            { $match: { userId: reqBody.userId } },
            {
                $lookup: {
                    from: 'Product', localField: 'barcodeId', foreignField: 'barcodeId',
                    as: 'productDetails'
                },
            },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        ])
        let mrpTotal = 0
        let priceTotal = 0
        let subTotal = 0
        let totalTax = 0
        for (const element of cart) {
            mrpTotal += element.productDetails.mrp * element.quantity
            priceTotal += element.productDetails.price * element.quantity
            subTotal += element.productDetails.price * element.quantity
        }

        let cartObj = {
            cartLists: cart,
            payment: {
                itemCount: cart.length,
                mrpTotal: (mrpTotal).toFixed(2),
                priceTotal: (priceTotal).toFixed(2),
                subTotal: Number(subTotal.toFixed(2)),
                totalAmount: (subTotal).toFixed(2),
            },
            cartCount: cart.length
        }
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.CART.GET_CART_ITEM,
            data: cartObj
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.orderPlaced = async (reqBody) => {
    try {
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.USER.USER_LIST
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};
