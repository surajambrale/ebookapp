const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get('/my-books/:userId', bookController.getMyBooks);


const DynamicBook = require('../models/DynamicBook');

router.get('/all', async (req, res) => {

    try {

        const books = await DynamicBook.find().sort({ createdAt: -1 });

        res.json(books);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

module.exports = router;