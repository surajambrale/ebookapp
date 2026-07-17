const DynamicBook = require('../models/DynamicBook');

exports.uploadBook = async (req, res) => {

    try {

        const {

            title,
            author,
            category,
            description,
            price,
            originalPrice

        } = req.body;

        const coverImage = req.files.cover[0].path;

        const pdfUrl = req.files.pdf[0].path;

        const previewImages = req.files.preview
            ? req.files.preview.map(file => file.path)
            : [];

        const book = new DynamicBook({

            title,
            author,
            category,
            description,

            price,

            originalPrice,

            coverImage,

            pdfUrl,

            previewImages

        });

        await book.save();

        res.json({

            success: true,

            message: "Book Uploaded Successfully",

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