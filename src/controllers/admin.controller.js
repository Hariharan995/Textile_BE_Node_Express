const { adminService } = require('../services');
const { getAllUsers, getAllProducts, getAllSales, userApproval, updateCreditPoints } = require('../validator/validation')
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

exports.getAllBuyers = async (req, res) => {
    try {
        await getAllUsers.validateAsync(req.body)
        const userList = await adminService.getAllBuyers(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllBuyers API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        await getAllProducts.validateAsync(req.body)
        const userList = await adminService.getAllProducts(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllProducts API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        await getAllSales.validateAsync(req.body)
        const userList = await adminService.getAllSales(req);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in getAllUsers API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.userApproval = async (req, res) => {
    try {
        await userApproval.validateAsync(req.body)
        const userList = await adminService.userApproval(req.body);
        return res.status(userList.statusCode).send(userList)
    } catch (error) {
        console.log("Error in userApproval API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.getCreditPoints = async (req, res) => {
    try {
        const points = await adminService.getCreditPoints(req.body);
        return res.status(points.statusCode).send(points)
    } catch (error) {
        console.log("Error in getCreditPoints API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

exports.updateCreditPoints = async (req, res) => {
    try {
        await updateCreditPoints.validateAsync(req.body)
        const points = await adminService.updateCreditPoints(req.body);
        return res.status(points.statusCode).send(points)
    } catch (error) {
        console.log("Error in updateCreditPoints API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};