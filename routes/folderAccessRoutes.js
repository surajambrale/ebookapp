const express = require('express');

const router = express.Router();

const requireAuth = require('../middleware/auth');

const {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess,
  getFolderDetails
} = require('../controllers/folderAccessController');


// CHECK CURRENT USER FOLDER ACCESS
router.get(
  '/check/:folderId',
  requireAuth,
  checkFolderAccess
);


// ADMIN GRANT ACCESS
router.post(
  '/grant',
  requireAuth,
  grantFolderAccess
);


// GET USER ACCESS
router.get(
  '/user/:userId',
  requireAuth,
  getUserFolderAccess
);


// GET FOLDER DETAILS
router.get(
  '/detail/:folderId',
  requireAuth,
  getFolderDetails
);


module.exports = router;