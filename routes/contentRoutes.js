const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');
const requireAuth = require('../middleware/auth');

router.post('/note', contentController.createNote);

router.get(
    '/folder/:folderId',
    requireAuth,
    contentController.getFolderContents
);

router.delete('/:id', contentController.deleteContent);

module.exports = router;
