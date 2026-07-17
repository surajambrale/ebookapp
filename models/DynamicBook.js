const mongoose = require('mongoose');

const dynamicBookSchema = new mongoose.Schema({

    title: String,

    author: String,

    category: String,

    description: String,

    price: Number,

    originalPrice: Number,

    coverImage: String,

    pdfUrl: String,

    previewImages: {

        type: [String],

        default: []

    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "DynamicBook",
        dynamicBookSchema
    );