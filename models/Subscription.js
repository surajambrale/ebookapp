const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    planName: {
        type: String,
        default: "Monthly Premium"
    },

    amount: {
        type: Number,
        default: 99
    },

    paymentId: String,

    orderId: String,

    startDate: {
        type: Date,
        default: Date.now
    },

    expiryDate: Date,

    status: {
        type: String,
        default: "active"
    },

    sevenDayReminder: {
        type: Boolean,
        default: false
    },

    threeDayReminder: {
        type: Boolean,
        default: false
    },

    oneDayReminder: {
        type: Boolean,
        default: false
    },

    expiredReminder: {
        type: Boolean,
        default: false
    },

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "Subscription",
    subscriptionSchema
);