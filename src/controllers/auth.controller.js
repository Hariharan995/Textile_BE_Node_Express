const { authService } = require('../services');
const { signInSchema, signUpSchema, signOutSchema, deleteUser, refreshToken } = require('../validator/validation')
const Authentication = require("../middleware/authentication");
const { CONSTANT_MSG } = require('../config/constant_messages');

// Register
exports.register = async (req, res) => {
    try {
        await signUpSchema.validateAsync(req.body);
        const user = await authService.createUser(req.body);
        return res.status(user.statusCode).send(user);
    } catch (error) {
        console.log("Error in Register API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        await signInSchema.validateAsync(req.body);
        let user = await authService.login(req.body);
        if (user.status != 'error') {
            user.token = await Authentication.getJwtToken(user.data);
        }
        return res.status(user.statusCode).send(user);
    } catch (error) {
        console.log("Error in Login API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        await signOutSchema.validateAsync(req.body);
        const user = await authService.logout(req.body);
        return res.status(user.statusCode).send(user);
    } catch (error) {
        console.log("Error in Logout API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

// deleteUser
exports.deleteUser = async (req, res) => {
    try {
        await deleteUser.validateAsync(req.body);
        const user = await authService.deleteUser(req.body);
        return res.status(user.statusCode).send(user);
    } catch (error) {
        console.log("Error in deleteUser API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};
// Refresh Token
exports.refreshToken = async (req, res) => {
    try {
        await refreshToken.validateAsync(req.body);
        const refreshTokenDetails = await authService.refreshToken(req.body);
        return res.status(refreshTokenDetails.statusCode).send(refreshTokenDetails);
    } catch (error) {
        console.log("Error in Refresh Token API: ", error);
        return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
    }
};

// // Social Register 
// exports.socialLogin = async (req, res) => {
//     try {
//         await socialLogin.validateAsync(req.body);
//         const user = await authService.socialLogin(req.body);
//         if (user.status != 'error') {
//             let token;
//             if (req.body.isMobileApp) {
//                 token = await Authentication.getJwtTokenForMbl(user.data);
//             } else {
//                 token = await Authentication.getJwtToken(user.data);
//             }
//             user.token = token;
//         }
//         return res.status(user.statusCode).send(user);
//     } catch (error) {
//         console.log("Error in Social Register API: ", error);
//         return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
//     }
// };

// // OTP Verification
// exports.otpVerification = async (req, res) => {
//     try {
//         await otpverify.validateAsync(req.body);
//         let user
//         if (req.body.emailOtp !== undefined || req.body.mobileOtp !== undefined) {
//             user = await authService.otpVerification(req.body);
//         }
//         else if ((req.body.otp !== undefined)) {
//             user = await authService.otpVerification(req.body);
//         }
//         else {
//             let users = {
//                 statusCode: 400,
//                 status: CONSTANT_MSG.STATUS.ERROR,
//                 message: CONSTANT_MSG.OTP.OTP_NOT_RECEIVED
//             }
//             return res.status(users.statusCode).send(users);
//         }
//         if (user.status != 'error') {
//             let token;
//             if (req.body.isMobileApp) {
//                 token = await Authentication.getJwtTokenForMbl(user.data);
//             } else {
//                 token = await Authentication.getJwtToken(user.data);
//             }
//             user.token = token;
//         }
//         if (user.statusCode === 200 && !user.data.buyerContactId && user.data.userRole.includes("BUYER")) {
//             await crmService.addContact(user.data, 'BUYER');
//         }
//         return res.status(user.statusCode).send(user);
//     } catch (error) {
//         console.log("Error in OTP verify API: ", error);
//         return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
//     }
// };

// // ForgotPassword 
// exports.forgotPassword = async (req, res) => {
//     try {
//         await forgotPassword.validateAsync(req.body);
//         const user = await authService.forgotPassword(req.body);
//         return res.status(user.statusCode).send(user);
//     } catch (error) {
//         console.log("Error in Forgot Password API: ", error);
//         return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
//     }
// };

// // Change Password
// exports.changePassword = async (req, res) => {
//     try {
//         await changePassword.validateAsync(req.body);
//         const user = await authService.changePassword(req.body);
//         if (user.status != 'error') {
//             let token;
//             if (req.body.isMobileApp) {
//                 token = await Authentication.getJwtTokenForMbl(user.data);
//             } else {
//                 token = await Authentication.getJwtToken(user.data);
//             }
//             user.token = token;
//         }
//         return res.status(user.statusCode).send(user);
//     } catch (error) {
//         console.log("Error in Change Password API: ", error);
//         return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
//     }
// };

// exports.newPasswordByOldPassword = async (req, res) => {
//     try {
//         await newPasswordByOldPassword.validateAsync(req.body);
//         const user = await authService.newPasswordByOldPassword(req.body);
//         return res.status(user.statusCode).send(user);
//     } catch (error) {
//         console.log("Error in newPasswordByOldPassword API: ", error);
//         return res.status(500).send({ statusCode: 500, status: CONSTANT_MSG.STATUS.ERROR, message: error.message });
//     }
// };

