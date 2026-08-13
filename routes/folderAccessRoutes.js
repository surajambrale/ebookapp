const express = require('express');

const router = express.Router();

const {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess
} = require('../controllers/folderAccessController');


// USER
router.get(
  '/check/:folderId',
  checkFolderAccess
);


// ADMIN
router.post(
  '/grant',
  grantFolderAccess
);


// ADMIN
router.get(
  '/user/:userId',
  getUserFolderAccess
);


module.exports = router;