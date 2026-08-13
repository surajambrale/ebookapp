const express = require('express');

const router = express.Router();

const {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess,
  getFolderDetails
} = require('../controllers/folderAccessController');


// CHECK CURRENT USER FOLDER ACCESS
router.get(
  '/check/:folderId',
  checkFolderAccess
);


// ADMIN GRANT ACCESS
router.post(
  '/grant',
  grantFolderAccess
);


// GET USER ACCESS
router.get(
  '/user/:userId',
  getUserFolderAccess
);


// GET FOLDER DETAILS
router.get(
  '/detail/:folderId',
  getFolderDetails
);


module.exports = router;