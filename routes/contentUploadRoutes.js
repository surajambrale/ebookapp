const express = require('express');

const router = express.Router();

const upload = require('../config/multer');

const Content = require('../models/Content');
const Folder = require('../models/Folder');


// =====================================
// 📤 UPLOAD PDF / VIDEO
// =====================================

router.post(

    '/upload',

    upload.fields([

        {
            name: 'file',
            maxCount: 1
        },

        {
            name: 'thumbnail',
            maxCount: 1
        }

    ]),

    async (req, res) => {

        try {

            const {
                title,
                folderId,
                type
            } = req.body;


            // =====================================
            // VALIDATION
            // =====================================

            if (!title || !folderId || !type) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Title, folderId and type are required'

                });

            }


            if (!['pdf', 'video'].includes(type)) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Only PDF and Video are allowed'

                });

            }


            // =====================================
            // CHECK FOLDER
            // =====================================

            const folder =
                await Folder.findById(folderId);


            if (!folder) {

                return res.status(404).json({

                    success: false,

                    message: 'Folder not found'

                });

            }


            // =====================================
            // CHECK FILE
            // =====================================

            if (!req.files?.file?.[0]) {

                return res.status(400).json({

                    success: false,

                    message: 'Please select a file'

                });

            }


            const uploadedFile =
                req.files.file[0];


            // =====================================
            // THUMBNAIL
            // =====================================

            let thumbnail = '';


            if (req.files?.thumbnail?.[0]) {

                thumbnail =
                    req.files.thumbnail[0].path;

            }


            // =====================================
            // CREATE CONTENT
            // =====================================

            const content = new Content({

                title,

                folderId,

                type,

                url: uploadedFile.path,

                thumbnail,

                fileSize: uploadedFile.size

            });


            await content.save();


            // =====================================
            // RESPONSE
            // =====================================

            res.json({

                success: true,

                message:
                    `${type} uploaded successfully`,

                content

            });

        }

        catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

);


module.exports = router;