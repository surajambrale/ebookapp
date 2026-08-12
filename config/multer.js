const multer = require('multer');

const { CloudinaryStorage } =
    require('multer-storage-cloudinary');

const cloudinary =
    require('./cloudinary');


const storage = new CloudinaryStorage({

    cloudinary,

    params: async (req, file) => {


        // =====================================
        // NORMAL IMAGE
        // =====================================

        if (file.fieldname === 'image') {

            return {

                folder: 'ebook-app',

                allowed_formats: [
                    'jpg',
                    'jpeg',
                    'png',
                    'webp'
                ],

                resource_type: 'image'

            };

        }


        // =====================================
        // BOOK COVER
        // =====================================

        if (file.fieldname === 'cover') {

            return {

                folder: 'ebook-covers',

                allowed_formats: [
                    'jpg',
                    'jpeg',
                    'png',
                    'webp'
                ],

                resource_type: 'image'

            };

        }


        // =====================================
        // BOOK PREVIEW
        // =====================================

        if (file.fieldname === 'preview') {

            return {

                folder: 'ebook-preview',

                allowed_formats: [
                    'jpg',
                    'jpeg',
                    'png',
                    'webp'
                ],

                resource_type: 'image'

            };

        }


        // =====================================
        // EXISTING BOOK PDF
        // =====================================

        if (file.fieldname === 'pdf') {

            return {

                folder: 'ebook-pdfs',

                resource_type: 'raw',

                format: 'pdf'

            };

        }


        // =====================================
        // NEW CONTENT FILE
        // PDF + VIDEO
        // =====================================

        if (file.fieldname === 'file') {


            // -------------------------------
            // PDF
            // -------------------------------

            if (file.mimetype === 'application/pdf') {

                return {

                    folder: 'ebook-content-pdfs',

                    resource_type: 'raw',

                    format: 'pdf'

                };

            }


            // -------------------------------
            // VIDEO
            // -------------------------------

            if (file.mimetype.startsWith('video/')) {

                return {

                    folder: 'ebook-content-videos',

                    resource_type: 'video'

                };

            }


            // -------------------------------
            // INVALID FILE
            // -------------------------------

            throw new Error(
                'Only PDF and Video files are allowed'
            );

        }


        // =====================================
        // CONTENT THUMBNAIL
        // =====================================

        if (file.fieldname === 'thumbnail') {

            return {

                folder: 'ebook-content-thumbnails',

                allowed_formats: [
                    'jpg',
                    'jpeg',
                    'png',
                    'webp'
                ],

                resource_type: 'image'

            };

        }


        // =====================================
        // UNKNOWN FIELD
        // =====================================

        throw new Error(
            `Unsupported upload field: ${file.fieldname}`
        );

    }

});


const upload = multer({

    storage

});


module.exports = upload;