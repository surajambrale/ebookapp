const Purchase = require('../models/Purchase');
const Subscription = require('../models/Subscription');
const path = require('path');
const DynamicBook = require('../models/DynamicBook');

// ======================
// MY BOOKS
// ======================

exports.getMyBooks = async (req, res) => {

    try {

        const userId = req.params.userId;

        // Purchased Books
        const purchases = await Purchase.find({ userId });

        const purchasedIds = purchases.map(p => p.bookId.toString());

        // Subscription
        const subscription = await Subscription.findOne({

            userId,

            status: "active",

            expiryDate: {
                $gt: new Date()
            }

        });


        // Dynamic Books
        let dynamicBooks = [];

        if (subscription) {

            dynamicBooks = await DynamicBook.find();

        } else {

            dynamicBooks = await DynamicBook.find({

                _id: { $in: purchasedIds }

            });

        }

        // Merge both
        res.json([

            ...dynamicBooks

        ]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: err.message

        });

    }

};

// ======================
// CHECK ACCESS
// ======================

exports.checkBookAccess = async (req, res) => {

    try {

        const { userId, bookId } = req.params;

        // Subscription check
        const subscription = await Subscription.findOne({

            userId,

            status: "active",

            expiryDate: {
                $gt: new Date()
            }

        });

        if (subscription) {

            return res.json({
                access: true
            });

        }

        // Individual purchase
        const purchase = await Purchase.findOne({

            userId,

            bookId

        });

        res.json({

            access: !!purchase

        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

// ======================
// READ BOOK
// ======================

exports.readBook = async (req, res) => {

    try {

        const { userId, bookId } = req.params;

        const subscription = await Subscription.findOne({

            userId,

            status: "active",

            expiryDate: {
                $gt: new Date()
            }

        });

        let allowed = false;

        if (subscription) {

            allowed = true;

        } else {

            const purchase = await Purchase.findOne({

                userId,

                bookId

            });

            allowed = !!purchase;

        }

        if (!allowed) {

            return res.status(403).send("Access Denied");

        }

        const filePath = path.join(

            __dirname,

            "..",

            "books",

            `${bookId}.pdf`

        );

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader("Content-Disposition", "inline");

        res.sendFile(filePath);

    }

    catch (err) {

        console.log(err);

        res.status(500).send("Error");

    }

};


// ======================
// GET SINGLE BOOK
// ======================

exports.getBookById = async (req, res) => {

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

};