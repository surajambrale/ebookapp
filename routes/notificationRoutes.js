const express = require('express');

const router = express.Router();

const {

    getSettings,

    saveSettings,

    sendTestEmail

} = require('../controllers/notificationController');


// ========================
// GET SETTINGS
// ========================

router.get(

    '/settings',

    getSettings

);


// ========================
// SAVE SETTINGS
// ========================

router.post(

    '/settings',

    saveSettings

);


// ========================
// SEND TEST EMAIL
// ========================

router.post(

    '/test-email',

    sendTestEmail

);


module.exports = router;