const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
        },
        password: {
            type: String,
        },
        mobile: {
            type: String,
        },
        email: {
            type: String,
        },
        userRole: {
            type: Array,
        },
        userType: {
            type: String,
        },
        mobileOtp: {
            type: Number,
        },
        userStatus: {
            type: String,
        },
        sellerType: {
            type: String,
        },
        countryCode: {
            type: String,
        },
        isSocialLogin: {
            type: Boolean,
            default: false
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isCuratorApproved: {
            type: Boolean,
            default: false
        },
        isApprovedType: {
            type: String,
        },
        isDocVerified: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isMobileVerified: {
            type: Boolean,
            default: false
        },
        rejectReason: {
            type: String,
        },
        shopUrlId: {
            type: String,
        },
        curatorShopUrlId: {
            type: String,
        },
        ratingByAdmin: {
            type: String,
        },
        approvedDate: {
            type: Date,
        },
        curatorApprovedDate: {
            type: Date,
        },
        isShopFilled: {
            type: Boolean,
            default: false
        },
        isCuratorShopFilled: {
            type: Boolean,
            default: false
        },
        isBankFilled: {
            type: Boolean,
            default: false
        },
        isCuratorBankFilled: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isCuratorActive: {
            type: Boolean,
            default: true
        },
        isBotRegister: {
            type: Boolean,
            default: false
        },
        totalRating: {
            type: Number,
            default: 0
        },
        noteForSeller: {
            type: String,
        },
        contactId: {
            type: String,
        },
        buyerContactId: {
            type: String,
        },
        sellerContactId: {
            type: String,
        },
        curatorContactId: {
            type: String,
        },
        faqCount: {
            type: Number,
            default: 0
        },
        isEmailTrigger: {
            type: Boolean,
            default: true
        },
        userName: {
            type: String,
        },
        DOB: {
            type: Date,
        },
        gender: {
            type: String,
        },
        profileImage: {
            type: String,
        },
        about: {
            type: String,
        },
        preferences: {
            hobby: {
                type: Array
            },
            material: {
                type: Array
            },
            craft: {
                type: Array
            },
            regional: {
                type: Array
            },
            impactAndValues: {
                type: Array
            }
        },
        detailsOnYourProfile: {
            type: Array,
        },
        earnedPoints: {
            sharedPoints: {
                type: Number,
                default: 0
            },
            referedPoints: {
                type: Number,
                default: 0
            },
            usedPoints: {
                type: Number,
                default: 0
            },
            totalPoints: {
                type: Number,
                default: 0
            },
        },
        referralCode: {
            type: String,
        },
        language: {
            type: String,
            default: 'en'
        },
        completedTasks: {
            type: Array
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema, 'User');
module.exports = User;
