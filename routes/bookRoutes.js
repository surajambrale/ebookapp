const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get('/my-books/:userId', bookController.getMyBooks);

module.exports = router;