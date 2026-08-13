const express = require('express');

const router = express.Router();

const Folder = require('../models/Folder');
const Content = require('../models/Content');

const FolderAccess = require('../models/FolderAccess');

// =====================================
// GET ROOT FOLDERS
// =====================================

router.get('/', async (req, res) => {

  try {

    const folders = await Folder.find({
      parentId: null
    }).sort({
      createdAt: -1
    });

    res.json(folders);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});


// =====================================
// GET SUBFOLDERS
// =====================================

router.get('/:parentId', async (req, res) => {

  try {

    const folders = await Folder.find({
      parentId: req.params.parentId
    }).sort({
      createdAt: -1
    });

    res.json(folders);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});


// =====================================
// GET SINGLE FOLDER DETAILS
// =====================================

router.get('/detail/:id', async (req, res) => {

  try {

    const folder = await Folder.findById(
      req.params.id
    );

    if (!folder) {

      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });

    }


    // =====================================
    // SUB FOLDERS
    // =====================================

    const subFolders = await Folder.find({
      parentId: folder._id
    }).sort({
      createdAt: -1
    });


    // =====================================
    // FOLDER CONTENT
    // =====================================

    const contents = await Content.find({
      folderId: folder._id
    }).sort({
      createdAt: -1
    });


    // =====================================
    // USER ACCESS
    // =====================================

    let hasAccess = false;
    let access = null;

    /*
      IMPORTANT:

      Agar user login hai aur req.user available hai
      to us user ka folder access check hoga.

      Tumhare auth middleware me req.user.id
      available hona chahiye.
    */

    if (req.user && req.user.id) {

      access = await FolderAccess.findOne({

        user: req.user.id,

        folder: folder._id,

        isActive: true,

        expiryDate: {
          $gt: new Date()
        }

      });

      hasAccess = !!access;

    }


    // =====================================
    // RESPONSE
    // =====================================

    res.json({

      success: true,

      folder,

      subFolders,

      contents,

      hasAccess,

      access

    });

  } catch (err) {

    console.log(
      'GET FOLDER DETAIL ERROR:',
      err
    );

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================
// CREATE FOLDER
// =====================================

router.post('/', async (req, res) => {

  try {

    const {

      name,

      parentId,

      description,

      thumbnail,

      sellingPrice,

      offerPrice

    } = req.body;


    // =====================================
    // VALIDATION
    // =====================================

    if (!name || !name.trim()) {

      return res.status(400).json({

        success: false,

        message: 'Folder name is required'

      });

    }


    // =====================================
    // PRICE
    // =====================================

    const finalSellingPrice =
      Number(sellingPrice) || 0;

    const finalOfferPrice =
      Number(offerPrice) || 0;


    // =====================================
    // CREATE
    // =====================================

    const folder = new Folder({

      name: name.trim(),

      parentId: parentId || null,

      description: description || '',

      thumbnail: thumbnail || '',

      sellingPrice: finalSellingPrice,

      offerPrice: finalOfferPrice

    });


    await folder.save();


    // =====================================
    // RESPONSE
    // =====================================

    res.status(201).json({

      success: true,

      message: 'Folder created successfully',

      folder

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================
// UPDATE FOLDER
// =====================================

router.put('/:id', async (req, res) => {

  try {

    const folder = await Folder.findById(
      req.params.id
    );


    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    // =====================================
    // NAME
    // =====================================

    if (req.body.name !== undefined) {

      folder.name =
        req.body.name.trim();

    }


    // =====================================
    // DESCRIPTION
    // =====================================

    if (
      req.body.description !== undefined
    ) {

      folder.description =
        req.body.description;

    }


    // =====================================
    // THUMBNAIL
    // =====================================

    if (
      req.body.thumbnail !== undefined
    ) {

      folder.thumbnail =
        req.body.thumbnail;

    }


    // =====================================
    // SELLING PRICE
    // =====================================

    if (
      req.body.sellingPrice !== undefined
    ) {

      folder.sellingPrice =
        Number(req.body.sellingPrice) || 0;

    }


    // =====================================
    // OFFER PRICE
    // =====================================

    if (
      req.body.offerPrice !== undefined
    ) {

      folder.offerPrice =
        Number(req.body.offerPrice) || 0;

    }


    folder.updatedAt = new Date();


    await folder.save();


    res.json({

      success: true,

      message: 'Folder updated successfully',

      folder

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================
// DELETE FOLDER
// =====================================

router.delete('/:id', async (req, res) => {

  try {

    const folder = await Folder.findById(
      req.params.id
    );


    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    // =====================================
    // CHECK SUBFOLDERS
    // =====================================

    const childFolders =
      await Folder.countDocuments({

        parentId: folder._id

      });


    if (childFolders > 0) {

      return res.status(400).json({

        success: false,

        message:
          'Folder contains subfolders. Delete them first.'

      });

    }


    // =====================================
    // DELETE
    // =====================================

    await Folder.findByIdAndDelete(
      folder._id
    );


    res.json({

      success: true,

      message: 'Folder deleted successfully'

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


module.exports = router;