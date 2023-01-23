const { CONSTANT_MSG } = require('../config/constant_messages');
const { User, Product, Sale } = require('../models');
const moment = require("moment");

exports.getAllUsers = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filterObj = req.body.filterObj
        let filter_obj = {};
        let adminPipeline = [];

        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length - 1)
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

exports.getAllProducts = async (req) => {
    try {
        const page = req.body.page;
        const limit = req.body.limit;
        const skip = (page - 1) * limit;
        let sort_obj = req.body.sortObj;
        let filter_obj = {};
        let adminPipeline = [];
        let filterObj = req.body.filterObj

        if (filterObj && (filterObj.startDate && filterObj.endDate)) {
            if (filterObj.endDate) {
                endDate = new Date(filterObj.endDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = moment(endDate, "YYYY-MM-DD").toISOString()
                endDate = endDate.slice(0, endDate.length - 1)
            }
            if (filterObj.startDate) {
                filterObj.startDate = moment(filterObj.startDate, "YYYY-MM-DD").toISOString()
                filterObj.startDate = filterObj.startDate.slice(0, filterObj.startDate.length - 1)
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
        const totalRecordsCount = await Product.aggregate(adminPipeline)
        adminPipeline.push({ $skip: skip });
        adminPipeline.push({ $limit: limit });
        const productList = await Product.aggregate(adminPipeline)
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
        let adminPipeline = [];

        if (req.body.filterObj && req.body.filterObj?.searchValue) {
            filter_obj = {
                $or: [
                    // { email: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    // { mobile: { $regex: req.body.filterObj.searchValue, $options: 'i' } },
                    // { name: { $regex: req.body.filterObj.searchValue, $options: 'i' } }
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