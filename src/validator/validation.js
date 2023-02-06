const joi = require('joi');
const joiObjectId = require('joi-objectid')(joi)

module.exports.signUpSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().max(75).valid("mhariharanms@gmail.com"),
    mobile: joi.string().min(10),
    password: joi.string().min(6).max(30),
});

module.exports.signInSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(6).max(30).required(),
});

module.exports.signOutSchema = joi.object({
    token: joi.string().required()
});

module.exports.deleteUser = joi.object({
    userId: joiObjectId().required()
});

module.exports.getAllUsers = joi.object({
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    filterObj: joi.object({
        userRole: joi.string().valid("SELLER", "ADMIN").allow(''),
        searchValue: joi.string().allow(''),
        userStatus: joi.string().valid("APPROVED", "UNAPPROVED", "REJECTED").allow(''),
        startDate: joi.string().allow(''),
        endDate: joi.string().allow(''),
    }),
    sortObj: joi.object({
        createdAt: joi.number().valid(-1, 1),
        name: joi.number().valid(-1, 1)
    }).max(1)
});

module.exports.getAllProducts = joi.object({
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    filterObj: joi.object({
        searchValue: joi.string().allow(''),
        startDate: joi.string().allow(''),
        endDate: joi.string().allow(''),
    }),
    sortObj: joi.object({
        createdAt: joi.number().valid(-1, 1),
        name: joi.number().valid(-1, 1)
    }).max(1)
});

module.exports.getAllSales = joi.object({
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    filterObj: joi.object({
        searchValue: joi.string().allow(''),
        paymentType: joi.string().valid("ONLINEPAYMENT", "COD").allow(''),
        startDate: joi.string().allow(''),
        endDate: joi.string().allow(''),
    }),
    sortObj: joi.object({
        createdAt: joi.number().valid(-1, 1),
        name: joi.number().valid(-1, 1)
    }).max(1)
});

module.exports.userApproval = joi.object({
    userId: joiObjectId().required(),
    userStatus: joi.string().valid('APPROVED', 'REJECTED').required()
})
module.exports.updateCreditPoints = joi.object({
    point: joi.number().min(1).required(),
    amount: joi.number().min(1).required(),
    applyPercent: joi.number().min(1).required(),
    creditPointId: joiObjectId().required(),
})

module.exports.getSaleById = joi.object({
    saleId: joiObjectId().required(),
})

module.exports.addProduct = joi.object({
    sellerId: joiObjectId().required(),
    productName: joi.string().required(),
    productImage: joi.string().required(),
    barcodeId: joi.string().required(),
    gender: joi.string().required().valid("MALE", "FEMALE", "CHILD"),
    mrp: joi.number().min(1),
    price: joi.number().min(1).required(),
    quantity: joi.number().min(1).required(),
    description: joi.string(),
    brand: joi.string(),
    taxPercent: joi.number(),
});

module.exports.updateProduct = joi.object({
    sellerId: joiObjectId().required(),
    productId: joiObjectId().required(),
    productName: joi.string(),
    productImage: joi.string(),
    barcodeId: joi.string(),
    gender: joi.string().valid("MALE", "FEMALE", "CHILD"),
    mrp: joi.number().min(1),
    price: joi.number().min(1),
    quantity: joi.number().min(1),
    description: joi.string(),
    brand: joi.string(),
    taxPercent: joi.number(),
});

module.exports.deleteProduct = joi.object({
    productId: joiObjectId().required()
});

module.exports.getProductById = joi.object({
    productId: joiObjectId().required()
});

module.exports.addToCart = joi.object({
    userId: joiObjectId().required(),
    barcodeId: joi.string().required(),
    type: joi.string().valid('INCREASE', 'DECREASE')
});

module.exports.deleteSingleCart = joi.object({
    cartId: joiObjectId().required(),
});

module.exports.delelteAllCart = joi.object({
    userId: joiObjectId().required(),
});

module.exports.getAllCarts = joi.object({
    userId: joiObjectId().required()
});

module.exports.getBuyerDetails = joi.object({
    buyerMobile: joi.string().required(),
    buyerName: joi.string().required()
});

module.exports.orderPlaced = joi.object({
    sellerId: joiObjectId().required(),
    paymentType: joi.string().required().valid("ONLINEPAYMENT", "COD"),
    buyerId: joi.string(),
    discountAmount: joi.string(),
    isCreditApply: joi.boolean(),
});

module.exports.deleteSale = joi.object({
    orderId: joiObjectId().required(),
});