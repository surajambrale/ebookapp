const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get('/my-books/:userId', bookController.getMyBooks);


const DynamicBook = require('../models/DynamicBook');

router.get('/all', async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalBooks = await DynamicBook.countDocuments();

        const books = await DynamicBook.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({

            books,

            currentPage: page,

            totalPages: Math.ceil(totalBooks / limit),

            totalBooks

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

// GET SINGLE BOOK
router.get('/:id', async (req, res) => {

    try {

        const book = await DynamicBook.findById(req.params.id);

        if (!book) {

            return res.status(404).json({
                message: "Book Not Found"
            });

        }

        res.json(book);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: err.message

        });

    }

});

module.exports = router;