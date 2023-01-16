const express = require('express');
var multer = require('multer');

const Authentication = require("../middleware/authentication");
const { authController } = require('../controllers');
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
// router.post('/socialLogin', authController.socialLogin);
// router.post('/otpVerification', authController.otpVerification);
// router.post('/resendOtp', authController.resendOtp);
// router.post('/forgotPassword', authController.forgotPassword);
// router.post('/changePassword', authController.changePassword);
// router.post('/refreshToken', authController.refreshToken);

module.exports = router;
