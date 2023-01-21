const express = require('express');
var multer = require('multer');

const Authentication = require("../middleware/authentication");
const { authController , adminController, sellerController} = require('../controllers');
const router = express.Router();

const multerMid = multer({
    storage: multer.memoryStorage(), // no larger than 10mb.
    limits: {
        fileSize: 100 * 1024 * 1024
    }
})

//Auth Controller
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/deleteUser', Authentication.checkJwtToken, authController.deleteUser);
router.post('/refreshToken', authController.refreshToken);

// router.post('/otpVerification', authController.otpVerification);
// router.post('/resendOtp', authController.resendOtp);
// router.post('/forgotPassword', authController.forgotPassword);
// router.post('/changePassword', authController.changePassword);
// router.post('/refreshToken', authController.refreshToken);

// Admin Controller
router.post('/getAllUsers', Authentication.checkJwtToken, adminController.getAllUsers);
router.post('/getAllProducts', Authentication.checkJwtToken, adminController.getAllProducts);
router.post('/getAllSales', Authentication.checkJwtToken, adminController.getAllSales);

// Seller Controller
router.post('/addToCart', Authentication.checkJwtToken, sellerController.addToCart);
router.post('/deleteSingleCart', Authentication.checkJwtToken, sellerController.deleteSingleCart);
router.post('/delelteAllCart', Authentication.checkJwtToken, sellerController.delelteAllCart);
router.post('/getAllCarts', Authentication.checkJwtToken, sellerController.getAllCarts);
router.post('/orderPlaced', Authentication.checkJwtToken, sellerController.orderPlaced);


module.exports = router;
