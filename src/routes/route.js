const express = require('express');
var multer = require('multer');

const Authentication = require("../middleware/authentication");
const { authController, adminController, sellerController } = require('../controllers');
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
router.post('/deleteUser', Authentication.checkJwtToken, Authentication.checkUserRole(), authController.deleteUser);
router.post('/refreshToken', authController.refreshToken);

// router.post('/otpVerification', authController.otpVerification);
// router.post('/resendOtp', authController.resendOtp);
// router.post('/forgotPassword', authController.forgotPassword);
// router.post('/changePassword', authController.changePassword);
// router.post('/refreshToken', authController.refreshToken);

// Admin Controller
router.post('/getAllUsers', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getAllUsers);
router.post('/getAllProducts', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getAllProducts);
router.post('/getAllSales', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getAllSales);

// Seller Controller
router.post('/addProduct', Authentication.checkJwtToken, Authentication.checkUserRole(), sellerController.addProduct);
router.post('/updateProduct', Authentication.checkJwtToken, Authentication.checkUserRole(), sellerController.updateProduct);
router.post('/deleteProduct', Authentication.checkJwtToken, Authentication.checkUserRole(), sellerController.deleteProduct);
router.post('/getProductById', Authentication.checkJwtToken, Authentication.checkUserRole(), sellerController.getProductById);
router.post('/addToCart', Authentication.checkJwtToken, sellerController.addToCart);
router.post('/deleteSingleCart', Authentication.checkJwtToken, sellerController.deleteSingleCart);
router.post('/delelteAllCart', Authentication.checkJwtToken, sellerController.delelteAllCart);
router.post('/getAllCarts', Authentication.checkJwtToken, sellerController.getAllCarts);
router.post('/orderPlaced', Authentication.checkJwtToken, sellerController.orderPlaced);

module.exports = router;
