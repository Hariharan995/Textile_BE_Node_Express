const { getFile } = require('../config/constant_function');
const { CONSTANT_MSG } = require('../config/constant_messages');
const { Product, Cart, Sale, Buyer, CreditPoint } = require('../models');
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

exports.getBuyerDetails = async (reqBody) => {
    try {
        let buyer = await Buyer.findOne({ mobile: reqBody.buyerMobile }, { creditPoints: 1, mobile: 1, name: 1 })
        if (!buyer) {
            let buyers = new Buyer({ name: reqBody.buyerName, mobile: reqBody.buyerMobile })
            await buyers.save()
            buyer = await Buyer.findOne({ mobile: reqBody.buyerMobile }, { creditPoints: 1, mobile: 1, name: 1 })
        } else {
            await Buyer.updateOne({ _id: ObjectID(buyer._id) }, { name: reqBody.buyerName })
        }
        const creditDetails = await CreditPoint.findOne({})
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.BUYER.BUYER_DETAILS,
            data: {
                buyer: buyer,
                creditPointList: creditDetails
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.imageUpload = async (reqBody) => {
    try {
        let buyer = await Buyer.findOne({ mobile: reqBody.buyerMobile }, { creditPoints: 1, mobile: 1, name: 1 })
        if (!buyer) {
            let buyers = new Buyer({ name: reqBody.buyerName, mobile: reqBody.buyerMobile })
            await buyers.save()
            buyer = await Buyer.findOne({ mobile: reqBody.buyerMobile }, { creditPoints: 1, mobile: 1, name: 1 })
        } else {
            await Buyer.updateOne({ _id: ObjectID(buyer._id) }, { name: reqBody.buyerName })
        }
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.BUYER.BUYER_DETAILS,
            data: buyer
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
        let cart = await Cart.aggregate([
            { $match: { userId: reqBody.userId } },
            {
                $lookup: {
                    from: 'Product', localField: 'barcodeId', foreignField: 'barcodeId',
                    as: 'productDetails'
                },
            },
            { $match: { 'productDetails': { $ne: [] } } },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        ])
        let mrpTotal = 0
        let priceTotal = 0
        let subTotal = 0
        let totalTax = 0
        for (const [index, element] of cart.entries()) {
            cart[index].productDetails.productImageData = await getFile(element.productDetails.productImage)
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
                subTotal: (subTotal.toFixed(2)),
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
        const orderNo = await orderNoVerify();
        let buyerDetail = await buyerDetails(reqBody)
        let productList = [];
        let subTotal = 0, mrpTotal = 0, priceTotal = 0, totalAmount = 0;
        const creditPoint = await CreditPoint.findOne({})
        const cartList = await Cart.aggregate([
            { $match: { userId: reqBody.sellerId } },
            {
                $lookup: {
                    from: 'Product', localField: 'barcodeId', foreignField: 'barcodeId',
                    as: 'productDetails'
                },
            },
            { $match: { 'productDetails': { $ne: [] } } },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        ])
        if (cartList.length === 0) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.CART.CART_NOT_FOUND
            }
        }
        for (const element of cartList) {
            let product = {
                productId: element.productDetails._id,
                productName: element.productDetails.productName,
                productImage: element.productDetails.productImage,
                mrp: element.productDetails.mrp,
                price: element.productDetails.price,
                barcodeId: element.productDetails.barcodeId,
                quantity: element.quantity,
            }
            productList.push(product)
            mrpTotal += element.productDetails.mrp * element.quantity
            priceTotal += element.productDetails.price * element.quantity
            subTotal += element.productDetails.price * element.quantity
        }
        let order = {
            orderNo: orderNo,
            sellerId: reqBody.sellerId,
            paymentType: reqBody.paymentType,
            productList: productList,
            itemCount: productList.length,
            mrpTotal: Number(mrpTotal.toFixed(2)),
            priceTotal: Number(priceTotal.toFixed(2)),
            subTotal: reqBody.discountAmount ? Number(subTotal - reqBody.discountAmount).toFixed(2) : Number(subTotal.toFixed(2)),
            totalAmount: reqBody.discountAmount ? Number(subTotal - reqBody.discountAmount).toFixed(2) : Number(subTotal.toFixed(2))
        }
        if (reqBody.discountAmount) {
            order.discountAmount = reqBody.discountAmount
        }
        if (buyerDetail) {
            order.buyerId = buyerDetail._id
        }
        if (reqBody.isCreditApply && buyerDetail) {

            let applicableCreditAmount = order.totalAmount / (100 / creditPoint.applyPercent)
            let creditAmount = buyerDetail.creditPoints > applicableCreditAmount ? applicableCreditAmount : buyerDetail.creditPoints
            let creditPoints = Number(creditAmount).toFixed(2)
            order.creditAmount = Number(creditAmount).toFixed(2)
            order.subTotal = Number(order.subTotal - creditAmount).toFixed(2)
            order.totalAmount = Number(order.totalAmount - creditAmount).toFixed(2)
            await Buyer.updateOne({ _id: ObjectID(buyerDetail._id) }, { $inc: { creditPoint: (-(creditPoints)) } })
        }
        order = new Sale(order)
        await order.save()
        if (buyerDetail) {
            const point = Number((order.totalAmount / creditPoint.amount).toFixed(2))
            const totalAmounts = Number(order.totalAmount.toFixed(2))
            await Buyer.updateOne({ _id: buyerDetail._id }, { $inc: { creditPoints: point, buyCount: 1, buyAmount: totalAmounts } })
        }
        productUpdate(cartList)
        await Cart.deleteMany({ userId: reqBody.sellerId })
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.SALES.ORDER_PLACED,
            data: order
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.deleteSale = async (reqBody) => {
    try {
        await Sale.deleteOne({ _id: ObjectID(reqBody.orderId) })
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.SALES.SALE_REMOVED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

const orderNoVerify = async () => {
    const orderNo = Math.floor(1000000000 + Math.random() * 9000000000);;
    const order = await dbCheck(orderNo, 'orderNo');
    if (!order) {
        orderNoVerify();
    }
    return orderNo;
}

const dbCheck = async (verifyNo, verifyType) => {
    const order = await Sale.findOne({ orderNo: verifyNo })
    if (order) {
        return false
    }
    return true
}

const buyerDetails = async (reqBody) => {
    let buyerDetail = await Buyer.findOne({ _id: ObjectID(reqBody.buyerId) })
    return buyerDetail
}

const productUpdate = async (products) => {
    for (const product of products) {
        await Product.updateOne({ _id: ObjectID(product.productDetails._id) }, { $inc: { quantity: (-(product.quantity)), salesCount: product.quantity } })
    }
}