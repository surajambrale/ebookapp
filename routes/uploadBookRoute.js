const express = require('express');
const router = express.Router();

const { uploadBook } = require('../controllers/uploadBookController');

const {

    uploadCover,

    uploadPdf

} = require('../config/multer');

router.post(

    '/upload',

    uploadCover.fields([

        {
            name: 'cover',
            maxCount: 1
        }

    ]),

    uploadPdf.fields([

        {
            name: 'pdf',
            maxCount: 1
        }

    ]),

    uploadBook

);

module.exports = router;