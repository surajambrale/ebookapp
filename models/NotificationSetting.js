const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({

    welcomeEmail: {
        type: Boolean,
        default: true
    },

    purchaseEmail: {
        type: Boolean,
        default: true
    },

    subscriptionReminder: {
        type: Boolean,
        default: true
    },

    expiryReminder: {
        type: Boolean,
        default: true
    },

    dailyMotivation: {
        type: Boolean,
        default: false
    },

    weeklyNewsletter: {
        type: Boolean,
        default: false
    },

    reminderTime: {
        type: String,
        default: "09:00"
    }

});

module.exports = mongoose.model(
    "NotificationSetting",
    notificationSettingSchema
);