const express = require('express');
const router = express.Router();

const upload = require('../config/multer');

const { uploadBook } = require('../controllers/uploadBookController');
const { updateBook } = require('../controllers/updateBookController');

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
        },
        { name: "preview", maxCount: 5 }
    ]),

    uploadBook
);

const DynamicBook = require('../models/DynamicBook');


router.put(

'/update/:id',

upload.fields([

{ name:'cover', maxCount:1 },

{ name:'pdf', maxCount:1 },

{ name:'preview', maxCount:5 }

]),

async(req,res)=>{

try{

const book=await DynamicBook.findById(req.params.id);

if(!book){

return res.status(404).json({

success:false,

message:"Book Not Found"

});

}

book.title=req.body.title;

book.author=req.body.author;

book.category=req.body.category;

book.description=req.body.description;

book.price=req.body.price;

book.originalPrice=req.body.originalPrice;

if(req.files.cover){

book.coverImage=req.files.cover[0].path;

}

if(req.files.pdf){

book.pdfUrl=req.files.pdf[0].path;

}

if(req.files.preview){

book.previewImages=req.files.preview.map(file=>file.path);

}

await book.save();

res.json({

success:true,

message:"Book Updated Successfully",

book

});

}

catch(err){

console.log(err);

res.status(500).json({

success:false,

message:err.message

});

}

}

);

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


router.get('/search', async (req, res) => {

    try {

        const query = req.query.query || '';

        const books = await DynamicBook.find({

            $or: [

                { title: { $regex: query, $options: 'i' } },

                { author: { $regex: query, $options: 'i' } },

                { category: { $regex: query, $options: 'i' } }

            ]

        }).sort({ createdAt: -1 });

        res.json(books);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


module.exports = router;