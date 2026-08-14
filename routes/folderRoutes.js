const express = require('express');

const router = express.Router();

const Folder = require('../models/Folder');
const Content = require('../models/Content');
const FolderAccess = require('../models/FolderAccess');
const Subscription = require('../models/Subscription');
const requireAuth = require('../middleware/auth');


// =====================================================
// GET ROOT FOLDERS
// =====================================================

router.get('/', async (req, res) => {

  try {

    const parentId = req.query.parentId || null;

    const folders = await Folder.find({
      parentId
    })
      .sort({
        createdAt: -1
      });

    res.json(folders);

  } catch (err) {

    console.error(
      '❌ GET ROOT FOLDERS ERROR:',
      err
    );

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});


// =====================================================
// GET SINGLE FOLDER DETAILS
// IMPORTANT: This route must stay BEFORE /:parentId
// =====================================================

router.get('/detail/:id', requireAuth, async (req, res) => {

  try {

    // -------------------------------------------------
    // FIND FOLDER
    // -------------------------------------------------

    const folder = await Folder.findById(
      req.params.id
    );

    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    // -------------------------------------------------
    // SUB FOLDERS
    // -------------------------------------------------

    const subFolders = await Folder.find({

      parentId: folder._id

    })
      .sort({
        createdAt: -1
      });


    // -------------------------------------------------
    // CONTENT
    // -------------------------------------------------

    const rawContents = await Content.find({
      folderId: folder._id,
      active: true
    }).sort({ createdAt: -1 });


    // -------------------------------------------------
    // PRICE
    // -------------------------------------------------

    const sellingPrice =
      Number(folder.sellingPrice) || 0;

    const offerPrice =
      Number(folder.offerPrice) || 0;


    // -------------------------------------------------
    // FINAL PRICE
    // -------------------------------------------------

    let finalPrice = sellingPrice;

    if (
      offerPrice > 0 &&
      sellingPrice > 0 &&
      offerPrice < sellingPrice
    ) {

      finalPrice = offerPrice;

    }


    // -------------------------------------------------
    // ACCESS
    // -------------------------------------------------

    let hasAccess = false;

    let access = null;


    /*
      If auth middleware is attached to this route
      and req.user exists, check access here.

      Otherwise frontend's separate
      /folder-access/check/:id API will handle it.
    */

    if (
      req.user &&
      req.user.id
    ) {

      access =
        await FolderAccess.findOne({

          user: req.user.id,

          folder: folder._id,

          isActive: true,

          expiryDate: {
            $gt: new Date()
          }

        });

      hasAccess = !!access;

    }

    const subscriptionActive = !!(await Subscription.exists({
      userId: String(req.user.id),
      status: 'active',
      expiryDate: { $gt: new Date() }
    }));

    hasAccess = hasAccess || subscriptionActive;

    const contents = hasAccess
      ? rawContents
      : rawContents.map(item => {
          const obj = item.toObject();
          delete obj.url;
          delete obj.noteContent;
          return obj;
        });


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({

      success: true,

      folder,

      /*
        Explicit pricing object.
        Frontend can use this directly.
      */

      pricing: {

        sellingPrice,

        offerPrice,

        finalPrice

      },

      subFolders,

      contents,

      hasAccess,

      subscriptionActive,

      access

    });

  } catch (err) {

    console.error(
      '❌ GET FOLDER DETAIL ERROR:',
      err
    );

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================================
// GET SUB FOLDERS
// =====================================================

router.get('/:parentId', async (req, res) => {

  try {

    const folders = await Folder.find({
      parentId: req.params.parentId
    })
      .sort({
        createdAt: -1
      });

    res.json(folders);

  } catch (err) {

    console.error(
      '❌ GET SUB FOLDERS ERROR:',
      err
    );

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});


// =====================================================
// CREATE FOLDER
// =====================================================

router.post('/', async (req, res) => {

  try {

    const {

      name,

      parentId,

      description,

      thumbnail,

      sellingPrice,

      offerPrice,

      isPaid,

      accessDurationDays

    } = req.body;


    // -------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------

    if (
      !name ||
      !name.trim()
    ) {

      return res.status(400).json({

        success: false,

        message: 'Folder name is required'

      });

    }


    // -------------------------------------------------
    // PRICE
    // -------------------------------------------------

    const finalSellingPrice =
      Number(sellingPrice) || 0;

    const finalOfferPrice =
      Number(offerPrice) || 0;


    // -------------------------------------------------
    // OFFER PRICE VALIDATION
    // -------------------------------------------------

    if (
      finalOfferPrice > 0 &&
      finalSellingPrice > 0 &&
      finalOfferPrice > finalSellingPrice
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Offer price cannot be greater than selling price'

      });

    }


    // -------------------------------------------------
    // PAID / FREE
    // -------------------------------------------------

    const finalIsPaid =
      finalSellingPrice > 0;


    // -------------------------------------------------
    // ACCESS DURATION
    // -------------------------------------------------

    const finalAccessDuration =
      Number(accessDurationDays) > 0
        ? Number(accessDurationDays)
        : 30;


    // -------------------------------------------------
    // CREATE FOLDER
    // -------------------------------------------------

    const folder = new Folder({

      name:
        name.trim(),

      parentId:
        parentId || null,

      description:
        description || '',

      thumbnail:
        thumbnail || '',

      sellingPrice:
        finalSellingPrice,

      offerPrice:
        finalOfferPrice,

      isPaid:
        finalIsPaid,

      accessDurationDays:
        finalAccessDuration

    });


    await folder.save();


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(201).json({

      success: true,

      message:
        'Folder created successfully',

      folder

    });

  } catch (err) {

    console.error(
      '❌ CREATE FOLDER ERROR:',
      err
    );

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================================
// UPDATE FOLDER
// =====================================================

router.put('/:id', async (req, res) => {

  try {

    const folder =
      await Folder.findById(
        req.params.id
      );


    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    if (
      req.body.name !== undefined
    ) {

      folder.name =
        String(req.body.name).trim();

    }


    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    if (
      req.body.description !== undefined
    ) {

      folder.description =
        req.body.description;

    }


    // -------------------------------------------------
    // THUMBNAIL
    // -------------------------------------------------

    if (
      req.body.thumbnail !== undefined
    ) {

      folder.thumbnail =
        req.body.thumbnail;

    }


    // -------------------------------------------------
    // SELLING PRICE
    // -------------------------------------------------

    if (
      req.body.sellingPrice !== undefined
    ) {

      folder.sellingPrice =
        Number(
          req.body.sellingPrice
        ) || 0;

    }


    // -------------------------------------------------
    // OFFER PRICE
    // -------------------------------------------------

    if (
      req.body.offerPrice !== undefined
    ) {

      folder.offerPrice =
        Number(
          req.body.offerPrice
        ) || 0;

    }


    // -------------------------------------------------
    // OFFER PRICE VALIDATION
    // -------------------------------------------------

    if (

      folder.offerPrice > 0 &&

      folder.sellingPrice > 0 &&

      folder.offerPrice >
      folder.sellingPrice

    ) {

      return res.status(400).json({

        success: false,

        message:
          'Offer price cannot be greater than selling price'

      });

    }


    // -------------------------------------------------
    // IS PAID
    // -------------------------------------------------

    folder.isPaid =
      folder.sellingPrice > 0;


    // -------------------------------------------------
    // ACCESS DURATION
    // -------------------------------------------------

    if (
      req.body.accessDurationDays !== undefined
    ) {

      const duration =
        Number(
          req.body.accessDurationDays
        );

      if (duration > 0) {

        folder.accessDurationDays =
          duration;

      }

    }


    folder.updatedAt =
      new Date();


    await folder.save();


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({

      success: true,

      message:
        'Folder updated successfully',

      folder

    });

  } catch (err) {

    console.error(
      '❌ UPDATE FOLDER ERROR:',
      err
    );

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// =====================================================
// DELETE FOLDER
// =====================================================

router.delete('/:id', async (req, res) => {

  try {

    const folder =
      await Folder.findById(
        req.params.id
      );


    if (!folder) {

      return res.status(404).json({

        success: false,

        message: 'Folder not found'

      });

    }


    // -------------------------------------------------
    // CHECK SUBFOLDERS
    // -------------------------------------------------

    const childFolders =
      await Folder.countDocuments({

        parentId:
          folder._id

      });


    if (
      childFolders > 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Folder contains subfolders. Delete them first.'

      });

    }


    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------

    await Folder.findByIdAndDelete(
      folder._id
    );


    res.json({

      success: true,

      message:
        'Folder deleted successfully'

    });

  } catch (err) {

    console.error(
      '❌ DELETE FOLDER ERROR:',
      err
    );

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


module.exports = router;