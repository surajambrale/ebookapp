const mongoose = require("mongoose");

const SubscriptionSettingSchema = new mongoose.Schema({

    planName: {
        type: String,
        default: "Premium Membership"
    },

    price: {
        type: Number,
        default: 99
    },

    offerPrice: {
        type: Number,
        default: 49
    },

    duration: {
        type: Number,
        default: 30
    },

    badge: {
        type: String,
        default: "Most Popular"
    },

    active: {
        type: Boolean,
        default: true
    },

    features: [{
        type: String
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "SubscriptionSetting",
    SubscriptionSettingSchema
);