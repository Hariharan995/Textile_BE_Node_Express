const { CONSTANT_MSG } = require('../config/constant_messages');
const { User, Product, Sale, CreditPoint, Buyer } = require('../models');
const moment = require("moment");
const ObjectID = require('mongodb').ObjectId;
const { getFile } = require('../config/constant_function');

exports.getAllUsers = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filterObj = req.body.filterObj
        let filter_obj = {};
        let adminPipeline = [];
        adminPipeline.push({ $sort: { createdAt: -1 } })
        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length)
            }
            filter_obj.createdAt = { '$gte': new Date(filterObj.startDate), '$lte': new Date(endDate) }
        }

        if (req.body.filterObj && req.body.filterObj?.searchValue) {
            filter_obj = {
                $or: [
                    { email: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { mobile: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { name: { $regex: req.body.filterObj.searchValue, $options: 'i' } }
                ]
            }
        }
        if (req.body.filterObj && req.body.filterObj.userRole) {
            filter_obj.userRole = req.body.filterObj.userRole
        }
        if (req.body.filterObj && req.body.filterObj.userStatus) {
            filter_obj.userStatus = req.body.filterObj.userStatus
        }

        if (Object.entries(filter_obj).length != 0) {
            const filter_app =
            {
                $match: filter_obj
            };
            adminPipeline.push(filter_app);
        }
        adminPipeline.push({
            $project: {
                "_id": 1, "name": 1, "mobile": 1, "email": 1, "userRole": 1, "isVerified": 1, "isActive": 1, "userStatus": 1, "countryCode": 1, "isApproved": 1, "createdAt": 1, "updatedAt": 1,
            }
        })
        if (sort_obj) {
            const sort_app =
            {
                $sort: sort_obj
            };
            adminPipeline.push(sort_app)
        }
        else {
            adminPipeline.push({ $sort: { "createdAt": -1 } })
        }
        const totalRecordsCount = await User.aggregate(adminPipeline)
        adminPipeline.push({ $skip: skip });
        adminPipeline.push({ $limit: limit });
        const userList = await User.aggregate(adminPipeline)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.USER.USER_LIST,
            data: userList || [],
            count: totalRecordsCount.length || 0
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getAllBuyers = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filterObj = req.body.filterObj
        let filter_obj = {};
        let adminPipeline = [];
        adminPipeline.push({ $sort: { buyAmount: -1, creditPoints: -1 } })
        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length)
            }
            filter_obj.createdAt = { '$gte': new Date(filterObj.startDate), '$lte': new Date(endDate) }
        }

        if (req.body.filterObj && req.body.filterObj?.searchValue) {
            filter_obj = {
                $or: [
                    { mobile: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { name: { $regex: req.body.filterObj.searchValue, $options: 'i' } }
                ]
            }
        }

        if (Object.entries(filter_obj).length != 0) {
            const filter_app =
            {
                $match: filter_obj
            };
            adminPipeline.push(filter_app);
        }
        adminPipeline.push({
            $project: {
                "__v": 0,
            }
        })
        if (sort_obj) {
            const sort_app =
            {
                $sort: sort_obj
            };
            adminPipeline.push(sort_app)
        }
        const totalRecordsCount = await Buyer.aggregate(adminPipeline)
        adminPipeline.push({ $skip: skip });
        adminPipeline.push({ $limit: limit });
        const userList = await Buyer.aggregate(adminPipeline)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.USER.USER_LIST,
            data: userList || [],
            count: totalRecordsCount.length || 0
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getAllProducts = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filter_obj = {};
        let adminPipeline = [];
        let filterObj = req.body.filterObj
        adminPipeline.push({ $sort: { createdAt: -1 } })
        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length)
            }
            filter_obj.createdAt = { '$gte': new Date(filterObj.startDate), '$lte': new Date(endDate) }
        }
        if (req.body.filterObj && req.body.filterObj?.searchValue) {
            filter_obj = {
                $or: [
                    { productName: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { mrp: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { price: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { brand: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { barcodeId: { $regex: req.body.filterObj.searchValue, $options: 'i' } }
                ]
            }
        }
        if (Object.entries(filter_obj).length != 0) {
            const filter_app =
            {
                $match: filter_obj
            };
            adminPipeline.push(filter_app);
        }
        adminPipeline.push({
            $project: {
                "updatedAt": 0, "__v": 0
            }
        })
        if (sort_obj) {
            const sort_app =
            {
                $sort: sort_obj
            };
            adminPipeline.push(sort_app)
        }
        else {
            adminPipeline.push({ $sort: { "createdAt": -1 } })
        }
        const totalRecordsCount = await Product.aggregate(adminPipeline)
        adminPipeline.push({ $skip: skip });
        adminPipeline.push({ $limit: limit });
        const productList = await Product.aggregate(adminPipeline)
        for (const [index, product] of productList.entries()) {
            productList[index].productImageData = await getFile(product.productImage)
        }
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.PRODUCT.PRODUCT_LIST,
            data: productList || [],
            count: totalRecordsCount.length || 0
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getAllSales = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filter_obj = {};
        let adminPipeline = [
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    sellerObjId: { $toObjectId: "$sellerId" },
                    buyerObjId: { $toObjectId: "$buyerId" },
                }
            },
            {
                $lookup: {
                    from: 'User', localField: 'sellerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'sellerDetails'
                },
            },
            { $unwind: { path: "$sellerDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Buyer', localField: 'buyerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'buyerDetails'
                },
            },
            { $unwind: { path: "$buyerDetails", preserveNullAndEmptyArrays: true } },
        ];
        let filterObj = req.body?.filterObj
        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length)
            }
            filter_obj.createdAt = { '$gte': new Date(filterObj.startDate), '$lte': new Date(endDate) }
        }
        if (req.body.filterObj && req.body.filterObj?.searchValue) {
            filter_obj = {
                $or: [
                    { orderNo: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    { totalAmount: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                ]
            }
        }
        if (req.body.filterObj && req.body.filterObj.paymentType) {
            filter_obj.paymentType = req.body.filterObj.paymentType
        }

        if (Object.entries(filter_obj).length != 0) {
            const filter_app =
            {
                $match: filter_obj
            };
            adminPipeline.push(filter_app);
        }
        adminPipeline.push({
            $project: {
                "updatedAt": 0, "__v": 0
            }
        })
        if (sort_obj) {
            const sort_app =
            {
                $sort: sort_obj
            };
            adminPipeline.push(sort_app)
        }
        else {
            adminPipeline.push({ $sort: { "createdAt": -1 } })
        }
        const totalRecordsCount = await Sale.aggregate(adminPipeline)
        adminPipeline.push({ $skip: skip });
        adminPipeline.push({ $limit: limit });
        const saleList = await Sale.aggregate(adminPipeline)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.SALES.SALE_LIST,
            data: saleList || [],
            count: totalRecordsCount.length || 0
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.userApproval = async (reqBody) => {
    try {
        const user = await User.findOne({ _id: ObjectID(reqBody.userId) })
        if (!user) {
            return {
                statusCode: 400,
                status: CONSTANT_MSG.STATUS.ERROR,
                message: CONSTANT_MSG.USER.USER_NOT_FOUND
            }
        }
        await User.updateOne({ _id: ObjectID(reqBody.userId) }, reqBody)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: reqBody.userStatus == "APPROVED" ? CONSTANT_MSG.USER.USER_APPROVED_SUCCESSFULLY : CONSTANT_MSG.USER.USER_REJECTED_SUCCESSFULLY
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getCreditPoints = async () => {
    try {
        const points = await CreditPoint.find({})
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.CREDITPOINTS.CREDITPOINTS_DETAILS,
            data: points
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.updateCreditPoints = async (reqBody) => {
    try {
        await CreditPoint.updateOne({ _id: ObjectID(reqBody.creditPointId) }, reqBody)
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.CREDITPOINTS.CREDITPOINTS_UPDATED
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getSaleById = async (reqBody) => {
    try {
        let sale = await Sale.aggregate([
            { $match: { _id: ObjectID(reqBody.saleId) } },
            {
                $addFields: {
                    sellerObjId: { $toObjectId: "$sellerId" },
                    buyerObjId: { $toObjectId: "$buyerId" },
                }
            },
            {
                $lookup: {
                    from: 'User', localField: 'sellerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'sellerDetails'
                },
            },
            { $unwind: { path: "$sellerDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Buyer', localField: 'buyerObjId', foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, name: 1, mobile: 1 } }],
                    as: 'buyerDetails'
                },
            },
            { $unwind: { path: "$buyerDetails", preserveNullAndEmptyArrays: true } },
        ])
        sale = sale[0]
        for (const [index, element] of sale.productList.entries()) {
            sale.productList[index].productImageData = await getFile(element.productImage)
        }
        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.SALES.SALE_DETAILS,
            data: sale
        };
    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

exports.getDashboardDetails = async (req) => {
    try {
        let startDate = req?.startDate ? new Date(req.startDate) : new Date();
        let endDate = req?.endDate ? new Date(req.endDate) : new Date();
        if (!req.startDate) {
            startDate.setDate(startDate.getDate() - 30);
        }
        endDate.setDate(endDate.getDate() + 1);
        if (startDate) {
            startDate = moment(startDate, "YYYY-MM-DD").toISOString()
            startDate = startDate.slice(0, startDate.length - 1)
        }
        if (endDate) {
            endDate = moment(endDate, "YYYY-MM-DD").toISOString()
            endDate = endDate.slice(0, endDate.length - 1)
        }
        const orderDetails = await Sale.aggregate([
            { $match: { "createdAt": { '$gte': new Date(startDate), '$lte': new Date(endDate) } } },
            {
                $group: {
                    _id: 1,
                    orderCount: { $sum: 1 },
                    saleRevenue: { $sum: "$totalAmount" },
                    discountRevenue: {
                        "$sum": {
                            "$cond":
                            {
                                "if": { $ne: ["$discountAmount", null] },
                                "then": "$discountAmount",
                                "else": 0
                            }
                        }
                    },
                    creditRevenue: {
                        "$sum": {
                            "$cond":
                            {
                                "if": { $ne: ["$creditAmount", null] },
                                "then": "$creditAmount",
                                "else": 0
                            }
                        }
                    },
                }
            },
            { $project: { _id: 0 } }
        ])

        return {
            statusCode: 200,
            status: CONSTANT_MSG.STATUS.SUCCESS,
            message: CONSTANT_MSG.SALES.SALE_DETAILS,
            data: orderDetails[0]
        };

    } catch (error) {
        return {
            statusCode: 500,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: error.message,
        };
    }
};

