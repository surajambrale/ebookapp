const FolderAccess = require('../models/FolderAccess');
const Folder = require('../models/Folder');

// IMPORTANT:
// Apne actual content model ka path/name yaha rakho.
// Agar model ka naam LibraryContent hai:
const LibraryContent = require('../models/Content');


// =========================================================
// CHECK FOLDER ACCESS
// =========================================================

const checkFolderAccess = async (req, res) => {

  try {

    const { folderId } = req.params;

    if (!req.user || !req.user.id) {

      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });

    }

    const userId = req.user.id;

    const access = await FolderAccess.findOne({

      user: userId,

      folder: folderId,

      isActive: true,

      expiryDate: {
        $gt: new Date()
      }

    });

    res.json({

      success: true,

      hasAccess: !!access,

      access: access || null

    });

  } catch (error) {

    console.error(
      'CHECK FOLDER ACCESS ERROR:',
      error
    );

    res.status(500).json({

      success: false,

      message: 'Failed to check folder access'

    });

  }

};


// =========================================================
// GRANT FOLDER ACCESS FROM ADMIN
// =========================================================

const grantFolderAccess = async (req, res) => {

  try {

    const {
      userId,
      folderId,
      durationDays = 30
    } = req.body;


    if (!userId || !folderId) {

      return res.status(400).json({

        success: false,

        message: 'User and folder are required'

      });

    }


    // Check user/folder actually exist

    const folder = await Folder.findById(
      folderId
    );

    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    const startDate = new Date();

    const expiryDate = new Date(
      startDate
    );

    expiryDate.setDate(
      expiryDate.getDate() +
      Number(durationDays)
    );


    let access =
      await FolderAccess.findOne({

        user: userId,

        folder: folderId

      });


    if (access) {

      access.startDate =
        startDate;

      access.expiryDate =
        expiryDate;

      access.accessType =
        'admin';

      access.isActive =
        true;

      await access.save();

    } else {

      access =
        await FolderAccess.create({

          user: userId,

          folder: folderId,

          accessType: 'admin',

          startDate,

          expiryDate,

          isActive: true

        });

    }


    res.json({

      success: true,

      message:
        'Folder access granted successfully',

      access

    });

  } catch (error) {

    console.error(
      'GRANT FOLDER ACCESS ERROR:',
      error
    );

    res.status(500).json({

      success: false,

      message:
        'Failed to grant folder access'

    });

  }

};


// =========================================================
// GET USER FOLDER ACCESS
// =========================================================

const getUserFolderAccess = async (req, res) => {

  try {

    const userId =
      req.params.userId;


    const accesses =
      await FolderAccess
        .find({

          user: userId,

          expiryDate: {
            $gt: new Date()
          },

          isActive: true

        })
        .populate(
          'folder',
          'name description sellingPrice offerPrice parentId'
        )
        .sort({
          createdAt: -1
        });


    res.json({

      success: true,

      accesses

    });

  } catch (error) {

    console.error(
      'GET USER FOLDER ACCESS ERROR:',
      error
    );

    res.status(500).json({

      success: false,

      message:
        'Failed to get folder access'

    });

  }

};


// =========================================================
// GET FOLDER DETAILS
// =========================================================

const getFolderDetails = async (req, res) => {

  try {

    const {
      folderId
    } = req.params;


    const userId =
      req.user
        ? req.user.id
        : null;


    // =========================================
    // MAIN FOLDER
    // =========================================

    const folder =
      await Folder.findById(
        folderId
      );


    if (!folder) {

      return res.status(404).json({

        success: false,

        message:
          'Folder not found'

      });

    }


    // =========================================
    // SUB FOLDERS
    // =========================================

    const subFolders =
      await Folder.find({

        parentId: folder._id

      }).sort({

        createdAt: -1

      });


    // =========================================
    // ACCESS
    // =========================================

    let hasAccess = false;

    let access = null;


    if (userId) {

      access =
        await FolderAccess.findOne({

          user: userId,

          folder: folder._id,

          isActive: true,

          expiryDate: {

            $gt: new Date()

          }

        });


      hasAccess =
        !!access;

    }


    // =========================================
    // CONTENT
    // =========================================

    const contents =
      await LibraryContent.find({

        folder: folder._id

      }).sort({

        createdAt: -1

      });


    // =========================================
    // RESPONSE
    // =========================================

    res.json({

      success: true,

      folder,

      subFolders,

      contents,

      hasAccess,

      access

    });

  } catch (error) {

    console.error(
      'GET FOLDER DETAILS ERROR:',
      error
    );

    res.status(500).json({

      success: false,

      message:
        'Failed to load folder'

    });

  }

};


module.exports = {

  checkFolderAccess,

  grantFolderAccess,

  getUserFolderAccess,

  getFolderDetails

};