const Purchase = require('../models/Purchase');
const Subscription = require('../models/Subscription');
const books = require('../data/books');
const path = require('path');

// ======================
// MY BOOKS
// ======================

exports.getMyBooks = async (req, res) => {

    try {

        const userId = req.params.userId;

        // Purchased books
        const purchases = await Purchase.find({ userId });

        const purchasedIds = purchases.map(p => p.bookId.toString());

        // Active subscription
        const subscription = await Subscription.findOne({

            userId,

            status: "active",

            expiryDate: {
                $gt: new Date()
            }

        });

        let userBooks = [];

        if (subscription) {

            userBooks = books;

        } else {

            userBooks = books.filter(book =>
                purchasedIds.includes(book.id.toString())
            );

        }

        res.json(userBooks);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error loading books"
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