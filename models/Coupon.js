const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        unique: true,
        uppercase: true,
        required: true
    },

    discountType: {
        type: String,
        enum: ['flat', 'percentage'],
        default: 'flat'
    },

    discountValue: {
        type: Number,
        required: true
    },

    minimumOrder: {
        type: Number,
        default: 0
    },

    expiryDate: {
        type: Date,
        required: true
    },

    usageLimit: {
        type: Number,
        default: 100
    },

    usedCount: {
        type: Number,
        default: 0
    },

    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Coupon", couponSchema);