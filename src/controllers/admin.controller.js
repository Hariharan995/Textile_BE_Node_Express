const { adminService } = require('../services');
const { getAllUsers, } = require('../validator/validation')
const Authentication = require("../middleware/authentication");
const { CONSTANT_MSG } = require('../config/constant_messages');

// Register
exports.getAllUsers = async (req, res) => {
    try {
        await getAllUsers.validateAsync(req.body)
        const userList = await adminService.getAllUsers(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllUsers API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};