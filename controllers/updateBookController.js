const DynamicBook = require('../models/DynamicBook');

exports.updateBook = async (req, res) => {

    try {

        const {

            title,
            author,
            category,
            description,
            price,
            originalPrice

        } = req.body;

        const book = await DynamicBook.findById(req.params.id);

        if (!book) {

            return res.status(404).json({

                success: false,

                message: "Book Not Found"

            });

        }

        book.title = title;
        book.author = author;
        book.category = category;
        book.description = description;
        book.price = price;
        book.originalPrice = originalPrice;

        if (req.files.cover) {

            book.coverImage = req.files.cover[0].path;

        }

        if (req.files.pdf) {

            book.pdfUrl = req.files.pdf[0].path;

        }

        if (req.files.preview) {

            book.previewImages = req.files.preview.map(file => file.path);

        }

        await book.save();

        res.json({

            success: true,

            message: "Book Updated Successfully",

            book

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