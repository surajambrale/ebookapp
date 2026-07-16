const express = require('express');
const router = express.Router();

const upload = require('../config/multer');

const { uploadBook } = require('../controllers/uploadBookController');

router.post(
    '/upload',

    upload.fields([
        {
            name: 'cover',
            maxCount: 1
        },
        {
            name: 'pdf',
            maxCount: 1
        }
    ]),

    uploadBook
);

module.exports = router;