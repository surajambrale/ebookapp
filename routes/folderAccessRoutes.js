const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

const {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess,
  getMyFolderAccess,
  getFolderDetails
} = require('../controllers/folderAccessController');

router.get('/check/:folderId', requireAuth, checkFolderAccess);

router.post('/grant', verifyAdmin, grantFolderAccess);

router.get('/user/:userId', verifyAdmin, getUserFolderAccess);

router.get('/my', requireAuth, getMyFolderAccess);

router.get('/detail/:folderId', requireAuth, getFolderDetails);

module.exports = router;
