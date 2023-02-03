const express = require('express');
var multer = require('multer');

const Authentication = require("../middleware/authentication");
const { authController, adminController, sellerController } = require('../controllers');
const { singleFileUpload } = require('../config/fileUpload');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './src/productImages')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.originalname)
    }
})

const multerMid = multer({ storage: storage })

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
router.post('/getAllBuyers', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getAllBuyers);
router.post('/getAllProducts', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getAllProducts);
router.post('/getAllSales', Authentication.checkJwtToken, adminController.getAllSales);
router.post('/userApproval', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.userApproval);
router.get('/getCreditPoints', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.getCreditPoints);
router.post('/updateCreditPoints', Authentication.checkJwtToken, Authentication.checkUserRole(), adminController.updateCreditPoints);

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
router.post('/deleteSale', Authentication.checkJwtToken, sellerController.deleteSale);

router.post('/getBuyerDetails', Authentication.checkJwtToken, sellerController.getBuyerDetails);
router.post('/imageUpload', multerMid.single('file'), singleFileUpload);

module.exports = router;
