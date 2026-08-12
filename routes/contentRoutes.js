const express = require('express');

const router = express.Router();

const contentController =
    require('../controllers/contentController');


// =====================================
// CREATE NOTE
// =====================================

router.post(
    '/note',
    contentController.createNote
);


// =====================================
// GET CONTENTS OF FOLDER
// =====================================

router.get(
    '/folder/:folderId',
    contentController.getFolderContents
);


// =====================================
// DELETE CONTENT
// =====================================

router.delete(
    '/:id',
    contentController.deleteContent
);


module.exports = router;