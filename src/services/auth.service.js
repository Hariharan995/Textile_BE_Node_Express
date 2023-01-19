const { User, Token } = require('../models');
const bcrypt = require('bcryptjs');
const { CONSTANT_MSG } = require('../config/constant_messages');
const { EMAIL } = require('../config/templates');
const email = require('./email.service');
const ObjectID = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
require('dotenv').config()

// Register User
exports.createUser = async (reqBody) => {
  try {
    const hashedpassword = reqBody.password ? await bcrypt.hash(reqBody.password, 5) : '';
    if (reqBody.mobile && await User.findOne({ mobile: reqBody.mobile })) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.MOBILE_ALREADY_EXIST
      };
    }
    reqBody.userStatus = reqBody.userRole === 'SELLER' ? 'UNAPPROVED' : 'APPROVED'
    reqBody.password = hashedpassword
    let user = User(reqBody)
    await user.save()

    const userDetails = await User.findOne({ _id: user._id }, { _id: 1, mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1 })
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.RESIGTER_SUCCESSFULLY,
      data: userDetails
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

// Resend OTP
exports.resendOtp = async (reqBody) => {
  try {
    const user = await User.findOne({ $or: [{ mobile: reqBody.mobile }] })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.USER_NOT_REGISTED
      };
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    await User.updateOne({ _id: ObjectID(user.id.toString()) }, { otp: otp })
    const emailObj = {
      email: process.env.EMAIL_USERNAME,
      location: 'admin',
      template: EMAIL.ADMIN_EMAIL_SUBJECT.OTPVERIFYNOTIFY,
      subject: EMAIL.ADMIN_EMAIL_SUBJECT.OTPVERIFYNOTIFY,
      data: {
        sellerName: userDetails.name,
        otp: otp
      }
    }
    await email.sendEmail(emailObj)
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.OTP_SUCCESSFULLY
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

// Login
exports.login = async (reqBody) => {
  try {
    let user = await User.findOne({ $or: [{ mobile: reqBody.username }] }, { createdAt: 1, mobile: 1, name: 1, userRole: 1, isVerified: 1, isApproved: 1, id: 1, userStatus: 1, password: 1 })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.USER_NOT_REGISTED
      };
    }
    if (!user || !(await bcrypt.compare(reqBody.password, user.password))) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.INCORRECT_USERNAME_OR_PASSWORD
      };
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.LOGIN_SUCCESSFULLY,
      data: user
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

//Logout
exports.logout = async (logoutDetails) => {
  try {
    await Token.deleteOne({ token: logoutDetails.token });
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.LOGOUT_SUCCESSFULLY
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

exports.deleteUser = async (reqBody) => {
  try {
    let user = await User.findOne({ _id: ObjectID(reqBody.userId) })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.USER.USER_NOT_DETAILS
      };
    }
    await User.deleteOne({ _id: ObjectID(reqBody.userId) })
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.USER.USER_REMOVED
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    const userTokenDetailsArray = await User.aggregate([
      { $project: { userId: { $toString: "$_id" }, name: 1, email: 1, mobile: 1, userRole: 1 } },
      {
        $lookup: {
          from: 'Token',
          localField: "userId",
          foreignField: 'userId',
          pipeline: [{ $match: { token: refreshToken.token } },
          { $project: { token: 1 } }],
          as: 'tokenDetails'
        }
      }, { $unwind: '$tokenDetails' }, { $match: { userId: refreshToken.userId } }
    ]).limit(1);
    if (!userTokenDetailsArray.length) {
      return {
        statusCode: 401,
        message: CONSTANT_MSG.ERROR_MSG.UNAUTHORIZED_ERROR,
        data: { isLogout: true }
      }
    }
    const userTokenDetails = userTokenDetailsArray[0];
    let token;
    token = jwt.sign({ email: userTokenDetails.email, userRole: userTokenDetails.userRole, mobile: userTokenDetails.mobile, userId: userTokenDetails._id }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: "12h" })
    await Token.updateOne({ "_id": userTokenDetails.tokenDetails._id.toString() }, { token: token });
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.TOKEN_REFRESHED_SUCCESSFULLY,
      token: token
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

// Forgot Password
exports.forgotPassword = async (reqBody) => {
  try {
    let user = await User.findOne({ $or: [{ mobile: reqBody.username }, { email: reqBody.username }] })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.USER.USER_NOT_FOUND
      };
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    if (reqBody.username) {
      await User.updateOne({ _id: user._id }, { mobileOtp: otp })
      const mobileNumber = reqBody.username
      await constants.sendSMS('OTP_SEND', { mobileNumber, otp });
      user = await User.findOne({ mobile: reqBody.username }, { mobile: 1, email: 1, _id: 1 })
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.OTP.OTP_SEND_SUCCESSFULLY,
      data: user
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

// Change Password
exports.changePassword = async (reqBody) => {
  try {
    let user = await User.findOne({ $or: [{ mobile: reqBody.username }, { email: reqBody.username }] })
    const hashedpassword = await bcrypt.hash(reqBody.password, 5)
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.INCORRECT_USERNAME_OR_PASSWORD
      };
    }
    if ((await bcrypt.compare(reqBody.password, user.password))) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.PREVIOUS_PASSWORD
      };
    }
    let additionalSellerDetails = {
      password: hashedpassword.toString()
    }
    Object.assign(user, additionalSellerDetails);
    await user.save();
    user = user.userRole.includes("SELLER") ? await User.findOne({ _id: user.id }, { mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, isApproved: 1, isDocVerified: 1, isSocialLogin: 1, id: 1, userStatus: 1 }) : await Buyer.findOne({ _id: user.id }, { mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, isSocialLogin: 1, _id: 1 })
    // if (user.email != null) {
    //   const emailObj = {
    //     email: user.email,
    //     location: user.userRole.includes("SELLER") ? 'seller' : 'buyer',
    //     template: user.userRole.includes("SELLER") ? EMAIL.SELLER_EMAIL_TEMPLATE.NEWPASSWORDNOTIFY : EMAIL.BUYER_EMAIL_TEMPLATE.NEWPASSWORDNOTIFY,
    //     subject: user.userRole.includes("SELLER") ? EMAIL.SELLER_EMAIL_SUBJECT.NEWPASSWORDNOTIFY : EMAIL.BUYER_EMAIL_SUBJECT.NEWPASSWORDNOTIFY,
    //     data: {
    //       sellerName: user.name,
    //       password: reqBody.password
    //     }
    //   }
    // await email.sendEmail(emailObj)
    // }
    if (user.mobile != null) {
      const mobileNumber = user.mobile
      const password = reqBody.password
      const sellerName = user.name
      // await constants.sendSMS('RESET_OTP', { mobileNumber, password, sellerName });
    }
    let deliveryPincode = await Address.findOne({ buyerId: user._id.toString(), isDefaultAddress: true }).sort({ createdAt: -1 })
    if (deliveryPincode) {
      user.pincode = deliveryPincode.pincode
    }
    else {
      deliveryPincode = await Address.findOne({ buyerId: user._id.toString() }).sort({ createdAt: -1 })
      if (deliveryPincode) {
        user.pincode = deliveryPincode.pincode
      }
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.PASSWORD_CHANGED_SUCCESSFULLY,
      data: user
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};
