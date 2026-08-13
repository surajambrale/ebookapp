const express = require('express');

const router = express.Router();

const {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess
} = require('../controllers/folderAccessController');

// const authMiddleware = require('../middleware/authMiddleware');


// USER
router.get(
  '/check/:folderId',
  authMiddleware,
  checkFolderAccess
);


// ADMIN
router.post(
  '/grant',
  authMiddleware,
  grantFolderAccess
);


// ADMIN
router.get(
  '/user/:userId',
  authMiddleware,
  getUserFolderAccess
);


module.exports = router;