const { CONSTANT_MSG } = require('../config/constant_messages');
const { User } = require('../models');

exports.getAllUsers = async (req) => {
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