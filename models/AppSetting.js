const mongoose = require("mongoose");

const AppSettingSchema = new mongoose.Schema({

    appName: {
        type: String,
        default: "E-books"
    },

    logo: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },

    whatsapp: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        default: ""
    },

    instagram: {
        type: String,
        default: ""
    },

    facebook: {
        type: String,
        default: ""
    },

    youtube: {
        type: String,
        default: ""
    },

    website: {
        type: String,
        default: ""
    },

    version: {
        type: String,
        default: "1.0.0"
    }

}, { timestamps: true });

module.exports = mongoose.model("AppSetting", AppSettingSchema);