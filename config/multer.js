const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({

    cloudinary,

    params: async (req, file) => {

        if (file.fieldname === 'image') {

        return {

            folder: 'ebook-app',

            allowed_formats: ['jpg','jpeg','png','webp']

        };

    }

        if (file.fieldname === 'cover') {

            return {

                folder: 'ebook-covers',

                allowed_formats: ['jpg','jpeg','png','webp']

            };

        }

        if (file.fieldname === 'preview') {

            return {

                folder: 'ebook-preview',

                allowed_formats: ['jpg','jpeg','png','webp']

            };

        }

        if (file.fieldname === 'pdf') {

            return {

                folder: 'ebook-pdfs',

                resource_type: 'raw',

                format: 'pdf'

            };

        }

    }

});

const upload = multer({

    storage

});

module.exports = upload;