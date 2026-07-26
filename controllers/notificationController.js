const NotificationSetting = require('../models/NotificationSetting');
const nodemailer = require('nodemailer');

// Gmail Transport
const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    requireTLS: true,

    family: 4,

    connectionTimeout: 60000,

    greetingTimeout: 60000,

    socketTimeout: 60000,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

transporter.verify((err, success) => {

    if (err) {

        console.log("SMTP ERROR:", err);

    }

    else {

        console.log("SMTP READY");

    }

});

// ==========================
// GET SETTINGS
// ==========================

exports.getSettings = async (req, res) => {

    try {

        let settings = await NotificationSetting.findOne();

        if (!settings) {

            settings = await NotificationSetting.create({});

        }

        res.json(settings);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ==========================
// SAVE SETTINGS
// ==========================

exports.saveSettings = async (req, res) => {

    try {

        let settings = await NotificationSetting.findOne();

        if (!settings) {

            settings = new NotificationSetting(req.body);

        }

        else {

            Object.assign(settings, req.body);

        }

        await settings.save();

        res.json({

            success: true,

            message: "Notification Settings Saved"

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ==========================
// SEND TEST EMAIL
// ==========================

exports.sendTestEmail = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email Required"

            });

        }

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject: "SS Builds Notification Test",

            html: `

                <h2>✅ Notification Test</h2>

                <p>Your Email Notification System is Working Successfully.</p>

                <hr>

                <b>SS Builds Fitness & Nutrition</b>

            `

        });

        res.json({

            success: true,

            message: "Test Email Sent"

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};