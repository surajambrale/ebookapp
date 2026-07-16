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

const DynamicBook = require('../models/DynamicBook');

router.delete('/delete/:id', async (req, res) => {

    try {

        await DynamicBook.findByIdAndDelete(req.params.id);

        res.json({

            success: true,
            message: "Book Deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

});

module.exports = router;