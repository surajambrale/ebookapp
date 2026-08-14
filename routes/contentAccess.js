const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/auth');

const Content = require('../models/Content');
const FolderAccess = require('../models/FolderAccess');


// ============================================
// OPEN PROTECTED CONTENT
// ============================================

router.get(
  '/:contentId',
  requireAuth,
  async (req, res) => {

    try {

      const { contentId } = req.params;

      const userId = req.user.id;


      // ======================================
      // FIND CONTENT
      // ======================================

      const content = await Content.findById(contentId);

      if (!content) {

        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });

      }


      if (!content.active) {

        return res.status(403).json({
          success: false,
          message: 'Content is not available'
        });

      }


      // ======================================
      // NOTE
      // ======================================

      if (content.type === 'note') {

        const access = await FolderAccess.findOne({
          user: userId,
          folder: content.folderId,
          isActive: true,
          expiryDate: {
            $gt: new Date()
          }
        });

        if (!access) {

          return res.status(403).json({
            success: false,
            message: 'You do not have access to this content'
          });

        }


        return res.json({
          success: true,
          type: 'note',
          title: content.title,
          noteContent: content.noteContent
        });

      }


      // ======================================
      // CHECK FOLDER ACCESS
      // ======================================

      const access = await FolderAccess.findOne({

        user: userId,

        folder: content.folderId,

        isActive: true,

        expiryDate: {
          $gt: new Date()
        }

      });


      if (!access) {

        return res.status(403).json({

          success: false,

          message: 'You do not have access to this content'

        });

      }


      // ======================================
      // CONTENT URL
      // ======================================

      if (!content.url) {

        return res.status(404).json({

          success: false,

          message: 'File URL not available'

        });

      }


      // ======================================
      // REDIRECT ONLY AFTER ACCESS CHECK
      // ======================================

      return res.redirect(content.url);

    }

    catch (error) {

      console.error(
        'PROTECTED CONTENT ERROR:',
        error
      );

      return res.status(500).json({

        success: false,

        message: 'Unable to open content'

      });

    }

  }
);


module.exports = router;