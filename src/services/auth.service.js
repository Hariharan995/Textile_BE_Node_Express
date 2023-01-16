const { User, Token } = require('../models');
const bcrypt = require('bcryptjs');
const { CONSTANT_MSG } = require('../config/constant_messages');
const { EMAIL } = require('../config/templates');
const email = require('./email.service');
const ObjectID = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
require('dotenv').config()

// Register User
exports.createUser = async (reqBody) => {
  try {
    let user = User(reqBody)
    const otp = Math.floor(100000 + Math.random() * 900000)
    const hashedpassword = reqBody.password ? await bcrypt.hash(reqBody.password, 5) : '';
    userReferralCode = await referalCodeVerify();
    if (reqBody.mobile && await User.findOne({ mobile: reqBody.mobile })) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.EMAIL.MOBILENO_EXISTING
      };
    }
    if (reqBody.email != null && await User.findOne({ email: reqBody.email })) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.EMAIL.EMAIL_EXISTING
      };
    }

    let referralCodeCheck, AgentReferralCodeCheck;
    if (reqBody.referralCode) {
      AgentReferralCodeCheck = await Agent.findOne({ referralCode: reqBody.referralCode })
      if (AgentReferralCodeCheck && reqBody.userRole !== 'SELLER') {
        return {
          statusCode: 400,
          status: CONSTANT_MSG.STATUS.ERROR,
          message: CONSTANT_MSG.AUTH.REFERRALCODE_IS_INVALID
        };
      }
      referralCodeCheck = await User.findOne({ referralCode: reqBody.referralCode })
      if (!AgentReferralCodeCheck && !referralCodeCheck) {
        return {
          statusCode: 400,
          status: CONSTANT_MSG.STATUS.ERROR,
          message: CONSTANT_MSG.AUTH.REFERRALCODE_IS_INVALID
        };
      }

    }
    if (reqBody.mobile != null) {
      reqBody.mobileOtp = otp
      const mobileNumber = reqBody.mobile
      await constants.sendSMS('OTP_SEND', { mobileNumber, otp });
    }
    reqBody.userStatus = reqBody.userRole === 'SELLER' || reqBody.userRole === 'CURATOR' ? 'UNAPPROVED' : 'APPROVED'
    reqBody.password = hashedpassword
    user = reqBody.userRole === 'SELLER' || reqBody.userRole === 'CURATOR' ? User(reqBody) : Buyer(reqBody)
    user.referralCode = userReferralCode;
    await user.save()

    if (reqBody.referralCode && !AgentReferralCodeCheck) {
      referralCodePayload = {
        referrerId: referralCodeCheck._id,
        referralCode: reqBody.referralCode,
        referredUserId: user.id,
        referredUserRole: reqBody.userRole
      }
      const referralCodeModel = new Referral(referralCodePayload)
      referralCodeModel.save();
    }

    const userDetails = reqBody.userRole === 'BUYER' ? await Buyer.findOne({ _id: user.id }, { _id: 1, mobile: 1, email: 1, name: 1, isVerified: 1, userRole: 1, countryCode: 1 }) : await User.findOne({ _id: user._id }, { _id: 1, mobile: 1, email: 1, name: 1, userRole: 1, isDocVerified: 1, isVerified: 1, countryCode: 1 })
    if (reqBody.userRole === 'SELLER') {
      if (AgentReferralCodeCheck) {
        await Agent.updateOne({ referralCode: reqBody.referralCode }, { $push: { sellerIds: userDetails.id } })
      }
      const shopDetail = {
        sellerId: userDetails.id,
        businessEmail: userDetails.email,
        businessNo: userDetails.mobile
      }
      let shop = Shop(shopDetail)
      await shop.save()
    }
    if (reqBody.userRole === 'CURATOR') {
      const shopDetail = {
        curatorId: userDetails.id,
        businessEmail: userDetails.email,
        businessNo: userDetails.mobile
      }
      let shop = CuratorShop(shopDetail)
      await shop.save()
    }
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
    const otp = Math.floor(100000 + Math.random() * 900000)
    if (reqBody.mobile != null) {
      await User.updateOne({ mobile: reqBody.mobile }, { mobileOtp: otp })
      const mobileNumber = reqBody.mobile
      await constants.sendSMS('OTP_SEND', { mobileNumber, otp });
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.OTP.OTP_SEND_SUCCESSFULLY
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

// OTP Verify
exports.otpVerification = async (reqbody) => {
  try {
    const user = await User.findOne({ $or: [{ mobile: reqbody.username }, { email: reqbody.username }] })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.INCORRECT_USERNAME_OR_PASSWORD
      };
    }
    if (reqbody.otp) {
      if (user.mobileOtp != reqbody.otp) {
        return {
          statusCode: 400,
          status: CONSTANT_MSG.STATUS.ERROR,
          message: CONSTANT_MSG.OTP.INCORRECT_MOBILE_OTP
        };
      }
    }
    if (reqbody.mobileOtp && reqbody.mobileOtp != user.mobileOtp) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.OTP.INCORRECT_MOBILE_OTP
      };
    }
    else if (reqbody.mobileOtp) {
      let obj = {}
      if (reqbody.mobileOtp) {
        obj.isVerified = true
        obj.isMobileVerified = true
        obj.mobileOtp = ''
      }
      if (user.userRole.includes("BUYER")) {
        await Buyer.updateOne({ _id: user._id }, obj)
      }
      else {
        await User.updateOne({ _id: user._id }, obj)
      }
    }
    let userDetails = user.userRole.includes("SELLER") ? await User.aggregate([
      { $match: { _id: ObjectID(user.id) } },
      {
        $addFields: {
          sellerId: {
            $toString: "$_id"
          },
        }
      },
      {
        $lookup:
        {
          from: 'Shop',
          localField: 'sellerId',
          foreignField: 'sellerId',
          pipeline: [{
            $project: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0
            }
          }],
          as: 'shopDetails'
        }
      },
      {
        $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          password: 0,
          mobileOtp: 0,
          updatedAt: 0,
          __v: 0
        },
      },
    ]) : await Buyer.findOne({ _id: user.id }, { createdAt: 1, mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, language: 1 });
    userDetails = user.userRole.includes("SELLER") ? userDetails[0] : userDetails
    if (userDetails.email != null && reqbody.mobileOtp) {
      const emailObj = {
        email: userDetails.email,
        location: userDetails.userRole.includes("SELLER") ? 'seller' : userDetails.userRole.includes("CURATOR") ? 'curator' : 'buyer',
        template: userDetails.userRole.includes("SELLER") ? EMAIL.SELLER_EMAIL_TEMPLATE.REGISTEREDNOTIFY : userDetails.userRole.includes("CURATOR") ? EMAIL.CURATOR_EMAIL_TEMPLATE.REGISTEREDNOTIFY : EMAIL.BUYER_EMAIL_TEMPLATE.REGISTEREDNOTIFY,
        subject: userDetails.userRole.includes("SELLER") ? EMAIL.SELLER_EMAIL_SUBJECT.REGISTEREDNOTIFY : userDetails.userRole.includes("CURATOR") ? EMAIL.CURATOR_EMAIL_SUBJECT.REGISTEREDNOTIFY : EMAIL.BUYER_EMAIL_SUBJECT.REGISTEREDNOTIFY,
        data: {
          sellerName: userDetails.name
        }
      }
      await email.sendEmail(emailObj)
    }
    if (userDetails.mobile != null && reqbody.mobileOtp) {
      const mobileNumber = userDetails.mobile
      const sellerName = userDetails.name
      const curatorName = userDetails.name
      const template = userDetails.userRole.includes("CURATOR") ? 'CURATOR_REGISTERED' : 'RESGISTERED_SUCCESSFULLY'
      await constants.sendSMS(template, { sellerName, curatorName, mobileNumber });
    }
    userDetails.cartCount = await removeInactiveSellerProducts(userDetails._id.toString())
    let deliveryPincode = await Address.findOne({ buyerId: userDetails._id.toString(), isDefaultAddress: true }).sort({ createdAt: -1 })
    if (deliveryPincode) {
      userDetails.pincode = deliveryPincode.pincode
    }
    else {
      deliveryPincode = await Address.findOne({ buyerId: userDetails._id.toString() }).sort({ createdAt: -1 })
      if (deliveryPincode) {
        userDetails.pincode = deliveryPincode.pincode
      }
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.OTP.OTP_VERIFIED,
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

// Login
exports.login = async (reqBody) => {
  try {
    let user = await User.findOne({ $or: [{ mobile: reqBody.username }, { email: reqBody.username }] }, { createdAt: 1, mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, isApproved: 1, isDocVerified: 1, isSocialLogin: 1, id: 1, userStatus: 1, password: 1 })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.USER_NOT_REGISTED
      };
    }
    if (user.isSocialLogin == true && !user.password) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.USER_REGISTERED_BY_SOCIAL_LOGIN
      };
    }
    if (!user || !(await bcrypt.compare(reqBody.password, user.password))) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.INCORRECT_USERNAME_OR_PASSWORD
      };
    }
    let userDetails = user.userRole.includes("SELLER") ?
      await User.aggregate([{ $match: { $or: [{ mobile: reqBody.username }, { email: reqBody.username }] } }, {
        $addFields: {
          sellerId: {
            $toString: "$_id"
          },
        }
      },
      {
        $lookup:
        {
          from: 'Shop',
          localField: 'sellerId',
          foreignField: 'sellerId',
          pipeline: [{
            $project: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0
            }
          }],
          as: 'shopDetails'
        }
      },
      { $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          password: 0,
          mobileOtp: 0,
          updatedAt: 0,
          __v: 0
        }
      },
      ]) : user.userRole.includes("CURATOR") ? await User.aggregate([{ $match: { $or: [{ mobile: reqBody.username }, { email: reqBody.username }] } }, {
        $addFields: {
          sellerId: {
            $toString: "$_id"
          },
        }
      },
      {
        $lookup:
        {
          from: 'CuratorShop',
          localField: 'sellerId',
          foreignField: 'curatorId',
          pipeline: [{
            $project: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0
            }
          }],
          as: 'shopDetails'
        }
      },
      { $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          password: 0,
          mobileOtp: 0,
          updatedAt: 0,
          __v: 0
        }
      },
      ]) : await Buyer.findOne({ $or: [{ mobile: reqBody.username }, { email: reqBody.username }] }, { mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, isSocialLogin: 1, _id: 1 });
    userDetails = user.userRole.includes("SELLER") || user.userRole.includes("CURATOR") ? userDetails[0] : userDetails
    userDetails.cartCount = await removeInactiveSellerProducts(user.id)
    let deliveryPincode = await Address.findOne({ buyerId: user.id, isDefaultAddress: true }).sort({ createdAt: -1 })
    if (deliveryPincode) {
      userDetails.pincode = deliveryPincode.pincode
    }
    else {
      deliveryPincode = await Address.findOne({ buyerId: user.id }).sort({ createdAt: -1 })
      if (deliveryPincode) {
        userDetails.pincode = deliveryPincode.pincode
      }
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.LOGIN_SUCCESSFULLY,
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
// Social Register
exports.socialLogin = async (reqBody) => {
  try {
    if (!(reqBody.mobile || reqBody.email)) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.EMAIL_OR_MOBILE_IS_REQUIRED
      };
    }
    let user = null;
    let loginCreds = {
      email: reqBody.email,
      mobile: reqBody.mobile
    };
    if (reqBody.email) {
      user = await User.aggregate([
        { $match: { email: reqBody.email } }, { $addFields: { sellerId: { $toString: "$_id" } } },
        { $lookup: { from: 'Shop', localField: 'sellerId', foreignField: 'sellerId', pipeline: [{ $project: { id: 0, createdAt: 0, updatedAt: 0, __v: 0 } }], as: 'shopDetails' } },
        { $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true } },
        { $project: { password: 0, mobileOtp: 0, updatedAt: 0, __v: 0 } },
      ]);
    }
    else if (reqBody.mobile) {
      user = await User.aggregate([
        { $match: { mobile: reqBody.mobile } }, { $addFields: { sellerId: { $toString: "$_id" }, } },
        { $lookup: { from: 'Shop', localField: 'sellerId', foreignField: 'sellerId', pipeline: [{ $project: { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 } }], as: 'shopDetails' } },
        { $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true } },
        { $project: { password: 0, mobileOtp: 0, updatedAt: 0, __v: 0 } },
      ]);
    }
    if (user.length != 0 && await Social_User.findOne(loginCreds)) {
      user = user.length && user[0].userRole.includes("SELLER") ? user[0] : await Buyer.findOne(loginCreds, { updatedAt: 0, mobileOtp: 0, password: 0 });

      user.cartCount = await removeInactiveSellerProducts(user._id.toString())
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
        message: CONSTANT_MSG.AUTH.LOGIN_SUCCESSFULLY,
        data: user
      };
    }
    else if (user.length === 0) {
      if (!reqBody.userRole) {
        let obj = {
          isUserRole: false
        }
        return {
          statusCode: 400,
          status: CONSTANT_MSG.STATUS.ERROR,
          message: CONSTANT_MSG.AUTH.USERROLE_NEEDED,
          data: obj
        };
      }
      if (reqBody.userRole.includes("SELLER")) {
        if (!reqBody.sellerType) {
          let obj = {
            isSellerType: false
          }
          return {
            statusCode: 400,
            status: CONSTANT_MSG.STATUS.ERROR,
            message: CONSTANT_MSG.AUTH.SELLERTYPE_NEEDED,
            data: obj
          };
        }
      }
      let obj = {
        isVerified: true,
        mobile: reqBody.mobile,
        email: reqBody.email,
        name: reqBody.name,
        userRole: reqBody.userRole,
        isSocialLogin: true,
        isMobileVerified: reqBody.mobile ? true : false
      }
      if (reqBody.userRole.includes("SELLER")) {
        obj.isDocVerified = false
        obj.isApproved = false
      }
      obj.userStatus = reqBody.userRole.includes("SELLER") || reqBody.userRole.includes("CURATOR") ? 'UNAPPROVED' : 'APPROVED'
      user = reqBody.userRole.includes("SELLER") || reqBody.userRole.includes("CURATOR") ? User(obj) : Buyer(obj)
      const userReferralCode = await referalCodeVerify();
      user.referralCode = userReferralCode;
      let additionalSellerDetails = await user.save()
      if (reqBody.userRole.includes("SELLER")) {
        const shopDetail = {
          sellerId: additionalSellerDetails.id,
          businessEmail: additionalSellerDetails.email,
          businessNo: additionalSellerDetails.mobile
        }
        let shop = Shop(shopDetail)
        await shop.save()
      }
      if (reqBody.userRole.includes("CURATOR")) {
        const shopDetail = {
          curatorId: additionalSellerDetails.id,
          businessEmail: additionalSellerDetails.email,
          businessNo: additionalSellerDetails.mobile
        }
        let shop = CuratorShop(shopDetail)
        await shop.save()
      }
      additionalSellerDetails = reqBody.userRole.includes("SELLER") ? await User.aggregate([
        { $match: { _id: ObjectID(additionalSellerDetails.id) } },
        {
          $addFields: {
            sellerId: {
              $toString: "$_id"
            },
          }
        },
        {
          $lookup:
          {
            from: 'Shop',
            localField: 'sellerId',
            foreignField: 'sellerId',
            pipeline: [{
              $project: {
                _id: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0
              }
            }],
            as: 'shopDetails'
          }
        },
        { $unwind: { path: "$shopDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            password: 0,
            mobileOtp: 0,
            updatedAt: 0,
            __v: 0
          }
        },
      ]) : await Buyer.findOne({ _id: additionalSellerDetails.id }, { createdAt: 1, mobile: 1, email: 1, name: 1, userRole: 1, isVerified: 1, isSocialLogin: 1, _id: 1, userStatus: 1, language: 1 })
      reqBody.userId = additionalSellerDetails.id
      let social_user = Social_User(reqBody)
      await social_user.save()
      additionalSellerDetails = reqBody.userRole === 'SELLER' ? additionalSellerDetails[0] : additionalSellerDetails
      if (reqBody.email) {
        const emailObj = {
          email: reqBody.email,
          location: reqBody.userRole === 'SELLER' ? 'seller' : reqBody.userRole === 'CURATOR' ? 'curator' : 'buyer',
          template: reqBody.userRole === 'SELLER' ? EMAIL.SELLER_EMAIL_TEMPLATE.REGISTEREDNOTIFY : reqBody.userRole === 'CURATOR' ? EMAIL.CURATOR_EMAIL_TEMPLATE.REGISTEREDNOTIFY : EMAIL.BUYER_EMAIL_TEMPLATE.REGISTEREDNOTIFY,
          subject: reqBody.userRole === 'SELLER' ? EMAIL.SELLER_EMAIL_SUBJECT.REGISTEREDNOTIFY : reqBody.userRole === 'CURATOR' ? EMAIL.CURATOR_EMAIL_SUBJECT.REGISTEREDNOTIFY : EMAIL.BUYER_EMAIL_SUBJECT.REGISTEREDNOTIFY,
          data: {
            sellerName: reqBody.name
          }
        }
        await email.sendEmail(emailObj)
      }
      if (reqBody.mobile) {
        const mobileNumber = reqBody.mobile;
        const sellerName = reqBody.name;
        const curatorName = reqBody.name;
        const template = reqBody.userRole === "CURATOR" ? 'CURATOR_REGISTERED' : 'RESGISTERED_SUCCESSFULLY';
        await constants.sendSMS(template, { sellerName: sellerName, curatorName: curatorName, mobileNumber: mobileNumber });
      }
      additionalSellerDetails.cartCount = await removeInactiveSellerProducts(additionalSellerDetails._id.toString())
      let deliveryPincode = await Address.findOne({ buyerId: additionalSellerDetails._id.toString(), isDefaultAddress: true }).sort({ createdAt: -1 })
      if (deliveryPincode) {
        additionalSellerDetails.pincode = deliveryPincode.pincode
      }
      else {
        deliveryPincode = await Address.findOne({ buyerId: additionalSellerDetails._id.toString() }).sort({ createdAt: -1 })
        if (deliveryPincode) {
          additionalSellerDetails.pincode = deliveryPincode.pincode
        }
      }
      return {
        statusCode: 200,
        status: CONSTANT_MSG.STATUS.SUCCESS,
        message: CONSTANT_MSG.AUTH.RESIGTER_SUCCESSFULLY,
        data: additionalSellerDetails
      };
    }
    reqBody.userId = user[0]._id.toString()
    let social_user = Social_User(reqBody)
    await social_user.save()
    user[0].cartCount = await removeInactiveSellerProducts(user[0]._id.toString())
    let deliveryPincode = await Address.findOne({ buyerId: user[0]._id.toString(), isDefaultAddress: true }).sort({ createdAt: -1 })
    if (deliveryPincode) {
      user[0].pincode = deliveryPincode.pincode
    }
    else {
      deliveryPincode = await Address.findOne({ buyerId: user[0]._id.toString() }).sort({ createdAt: -1 })
      if (deliveryPincode) {
        user[0].pincode = deliveryPincode.pincode
      }
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.LOGIN_SUCCESSFULLY,
      data: user[0]
    };
  } catch (error) {
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
    // let emailORmobile = reqBody.username.split("@")
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

exports.newPasswordByOldPassword = async (reqBody) => {
  try {
    let user = await User.findOne({ _id: ObjectID(reqBody.userId) })
    const hashedpassword = await bcrypt.hash(reqBody.password, 5)
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.INCORRECT_USERNAME_OR_PASSWORD
      };
    }
    if (!(await bcrypt.compare(reqBody.oldPassword, user.password))) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.PREVIOUS_PASSWORD_NOT_MATCHED
      };
    }
    let additionalSellerDetails = {
      password: hashedpassword.toString()
    }
    Object.assign(user, additionalSellerDetails);
    await user.save();
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
    //   await email.sendEmail(emailObj)
    // }
    if (user.mobile != null) {
      const mobileNumber = user.mobile
      const password = reqBody.password
      const sellerName = user.name
      // await constants.sendSMS('RESET_OTP', { mobileNumber, password, sellerName });
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.PASSWORD_CHANGED_SUCCESSFULLY,
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
    if (refreshToken.isMobileApp) {
      token = jwt.sign({ email: userTokenDetails.email, userRole: userTokenDetails.userRole, mobile: userTokenDetails.mobile, userId: userTokenDetails._id }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: "90d" })
    } else {
      token = jwt.sign({ email: userTokenDetails.email, userRole: userTokenDetails.userRole, mobile: userTokenDetails.mobile, userId: userTokenDetails._id }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: "12h" })
    }
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



exports.becameCurator = async (reqBody) => {
  try {
    let user = await User.findOne({ _id: ObjectID(reqBody.userId) })
    if (user.userRole.includes("CURATOR")) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.CURATOR_ALREADY_REGISTERED,
      }
    }
    let shopDetail = {
      curatorId: user.id,
      businessEmail: user.email,
      businessNo: user.mobile
    }
    let shop = CuratorShop(shopDetail)
    await shop.save()
    user.userRole.push("CURATOR")
    const referralDetails = await Referral.find({ referredUserId: user.id });
    const referralCuratorDetails = referralDetails.length ? referralDetails.filter(item => (item.referredUserRole == 'CURATOR')) : [];
    if (!referralCuratorDetails.length && referralDetails.length) {
      referralCodePayload = {
        referrerId: referralDetails[0].referrerId,
        referralCode: referralDetails[0].referralCode,
        referredUserId: user.id,
        referredUserRole: "CURATOR"
      }
      const referralCodeModel = new Referral(referralCodePayload)
      referralCodeModel.save();
    }

    if (user.email != null) {
      const emailObj = {
        email: user.email,
        location: 'curator',
        template: EMAIL.CURATOR_EMAIL_TEMPLATE.REGISTEREDNOTIFY,
        subject: EMAIL.CURATOR_EMAIL_SUBJECT.REGISTEREDNOTIFY,
        data: {
          sellerName: user.name
        }
      }
      await email.sendEmail(emailObj)
    }
    if (user.mobile != null) {
      const mobileNumber = user.mobile
      const curatorName = user.name
      await constants.sendSMS('CURATOR_REGISTERED', { curatorName, mobileNumber });
    }
    await User.updateOne({ _id: ObjectID(user.id) }, user)
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.BECAME_CURATOR,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

exports.becameSeller = async (reqBody) => {
  try {
    let user = await User.findOne({ _id: ObjectID(reqBody.userId) })
    if (user.userRole.includes("SELLER")) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.AUTH.SELLER_ALREADY_REGISTERED,
      }
    }
    let shopDetail = {
      sellerId: user.id,
      businessEmail: user.email,
      businessNo: user.mobile
    }
    let shop = Shop(shopDetail)
    await shop.save()
    user.userRole.push("SELLER")

    const referralDetails = await Referral.find({ referredUserId: user.id })
    const referralCuratorDetails = referralDetails.length ? referralDetails.filter(item => (item.referredUserRole == 'SELLER')) : [];
    if (!referralCuratorDetails.length && referralDetails.length) {
      referralCodePayload = {
        referrerId: referralDetails[0].referrerId,
        referralCode: referralDetails[0].referralCode,
        referredUserId: user.id,
        referredUserRole: "SELLER"
      }
      const referralCodeModel = new Referral(referralCodePayload)
      referralCodeModel.save();
    }

    if (user.email != null) {
      const emailObj = {
        email: user.email,
        location: 'seller',
        template: EMAIL.SELLER_EMAIL_TEMPLATE.REGISTEREDNOTIFY,
        subject: EMAIL.SELLER_EMAIL_SUBJECT.REGISTEREDNOTIFY,
        data: {
          sellerName: user.name
        }
      }
      await email.sendEmail(emailObj)
    }
    if (user.mobile != null) {
      const mobileNumber = user.mobile
      const sellerName = user.name
      await constants.sendSMS('RESGISTERED_SUCCESSFULLY', { sellerName, mobileNumber });
    }
    await User.updateOne({ _id: ObjectID(user.id) }, user)
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.AUTH.BECAME_SELLER,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

exports.contactCreationWebhook = async (req) => {
  try {
    const notification = req.body;
    const receivedSignature = req.headers["x-aisensy-signature"];
    const sharedSecret = process.env.AI_SENSY_SECRET;
    const stringifyNotification = JSON.stringify(notification);
    //console.log('stringifyNotification', stringifyNotification);

    const generatedSignature = crypto.createHmac("sha256", sharedSecret).update(stringifyNotification).digest("hex");

    console.log('contactCreationWebhook - receivedSignature', receivedSignature);
    console.log('contactCreationWebhook - generatedSignature', generatedSignature);

    if (receivedSignature === generatedSignature) {
      const contactDetails = {
        name: notification.contact.name,
        mobile: notification.contact.phone_number,
        countryCode: notification.contact.country_code,
        contactId: notification.contact.id,
        source: notification.contact.source,
        contactCreatedAt: notification.contact.created_at,
        reqContactBody: stringifyNotification
      }
      const contact = new AiSensy(contactDetails);
      await contact.save();
      return {
        statusCode: 200,
        message: "Signature Matched"
      };

    } else {
      return {
        statusCode: 500,
        message: "Signature didn't Matched"
      };
    }
  } catch (error) {
    console.log('Error in contactCreationWebhook', error);
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};

exports.messageCreationWebhook = async (req) => {
  try {
    const notification = req.body;
    const receivedSignature = req.headers["x-aisensy-signature"];
    const sharedSecret = process.env.AI_SENSY_SECRET;
    const stringifyNotification = JSON.stringify(notification);
    // console.log('stringifyNotification', stringifyNotification);

    const generatedSignature = crypto.createHmac("sha256", sharedSecret).update(stringifyNotification).digest("hex");

    console.log('messageCreationWebhook - receivedSignature', receivedSignature);
    console.log('messageCreationWebhook - generatedSignature', generatedSignature);

    if (receivedSignature === generatedSignature) {
      console.log('Signature Matched')
      await AiSensy.updateOne({ mobile: notification.message.phone_number }, { reqMessageBody: stringifyNotification, isMessageVerified: true })
      return {
        statusCode: 200,
        message: "Signature Matched"
      };
    } else {
      console.log('Signature not Matched')
      return {
        statusCode: 500,
        message: "Signature didn't Matched"
      };
    }
  } catch (error) {
    console.log('Error in messageCreationWebhook', error);
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};

exports.referalCodeCreation = async () => {
  try {
    const userDetails = await User.find({ $or: [{ userRole: 'CURATOR' }, { userRole: 'BUYER' }, { userRole: 'SELLER' }] })
    let count = 0;
    await Promise.all(
      userDetails.map(async (x) => {
        if (x.userRole.includes("CURATOR") || x.userRole.includes("BUYER") || x.userRole.includes("SELLER")) {
          userReferralCode = await referalCodeVerify();
          console.log(x.userRole);
          count++;
          await User.updateOne({ _id: x._id }, { $set: { referralCode: userReferralCode } });
        }
      })
    )
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: "Referral code generated successfully ",
      count
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message,
    };
  }
};

const referalCodeVerify = async () => {
  const referal = Math.random().toString(36).substr(2, 5);
  const verify = await dbCheck(referal, 'referCode');
  if (!verify) {
    referalCodeVerify();
  }
  return referal;
}

const removeInactiveSellerProducts = async (buyerID) => {
  try {
    const cartDetails = await Cart.aggregate([{ $match: { buyerId: buyerID } },
    {
      $addFields: {
        productObjId: { $toObjectId: "$productId" },
      }
    },
    {
      $lookup: {
        from: 'Products', localField: 'productObjId', foreignField: '_id',
        pipeline: [{ $match: { $and: [{ productStatus: "APPROVED" }, { isProductHide: false }, { isProductDeleted: false }] } }, {
          $project: { isSellerActive: 1 }
        }],
        as: 'productDetails'
      },
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: { productId: 1, productDetails: 1, }
    }
    ])
    await Promise.all(
      cartDetails.map(async (cart) => {
        if (!cart.productDetails?.isSellerActive) {
          await Cart.deleteOne({ _id: cart._id });
          delete cart;
        }
      })
    )
    const cartCount = await Cart.find({ buyerId: buyerID }).count()
    return cartCount
  } catch (error) {
    console.log(error)
  }
}

exports.checkEmail = async (reqBody) => {
  try {
    const user = await User.findOne({ email: reqBody.email, "_id": { $ne: ObjectID(reqBody.userId) } })
    const shop = await Shop.findOne({ businessEmail: reqBody.email, "sellerId": { $ne: reqBody.userId } })
    const curatorShop = await CuratorShop.findOne({ businessEmail: reqBody.email, "curatorId": { $ne: reqBody.userId } })
    if (user || shop || curatorShop) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.SHOP.EMAIL_ALREADY_EXIST
      };
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.EMAIL.EMAIL_NOT_FOUND,
    };

  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message
    };
  }
}

exports.changeEmail = async (reqBody) => {
  try {
    const user = await User.findOne({ "_id": ObjectID(reqBody.userId) })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.USER.USER_NOT_FOUND
      };
    }
    if (user.email != reqBody.oldEmail) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.EMAIL.PREVIOUS_EMAIL_NOT_MATCHED
      };
    }
    const Token = jwt.sign({ email: reqBody.email, userId: reqBody.userId }, 'unipickclaritaz123', { expiresIn: '300s' });
    const urlLink = process.env.FE_API_LINK + 'confirmEmail?userId=' + reqBody.userId + '&email=' + reqBody.email + '&token=' + Token;
    if (reqBody.email != null) {
      const emailObj = {
        email: reqBody.email,
        location: 'buyer',
        template: EMAIL.BUYER_EMAIL_TEMPLATE.EMAILVERIFYNOTIFY,
        subject: EMAIL.BUYER_EMAIL_SUBJECT.EMAILVERIFYNOTIFY,
        data: {
          sellerName: user.name,
          emailVerifyAPI: urlLink
        }
      }
      await email.sendEmail(emailObj)
    }
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.EMAIL.EMAIL_VERIFIED_BY_EMAIL,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message
    };
  }
}

exports.confirmEmail = async (reqBody) => {
  try {
    const user = await User.findOne({ "_id": ObjectID(reqBody.userId) })
    if (!user) {
      return {
        statusCode: 400,
        status: CONSTANT_MSG.STATUS.ERROR,
        message: CONSTANT_MSG.USER.USER_NOT_FOUND
      };
    }
    const email = await EmailToken.findOne({ "token": reqBody.token, "userId": reqBody.userId, "email": reqBody.email })
    if (email) {
      return {
        statusCode: 401,
        message: CONSTANT_MSG.TOKEN.TOKEN_EXPIRED
      };
    }
    if (user.userRole.includes("SELLER")) {
      await Shop.updateOne({ "sellerId": reqBody.userId }, { businessEmail: reqBody.email })
    }
    if (user.userRole.includes("CURATOR")) {
      await CuratorShop.updateOne({ "curatorId": reqBody.userId }, { businessEmail: reqBody.email })
    }
    await User.updateOne({ "_id": ObjectID(reqBody.userId) }, { email: reqBody.email })

    let emailToken = EmailToken(reqBody)
    await emailToken.save()
    return {
      statusCode: 200,
      status: CONSTANT_MSG.STATUS.SUCCESS,
      message: CONSTANT_MSG.EMAIL.EMAIL_CHANGED_SUCCESSFULLY,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: CONSTANT_MSG.STATUS.ERROR,
      message: error.message
    };
  }
}