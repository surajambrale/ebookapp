const express = require('express');

const router = express.Router();

const Folder = require('../models/Folder');


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

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Sub folders
    const subFolders = await Folder.find({
      parentId: folder._id
    }).sort({
      createdAt: -1
    });

    // Folder content
    // IMPORTANT:
    // Yaha tumhare Content model ka exact naam/path
    // existing project ke according set karna hoga.
    const Content = require('../models/Content');

    const contents = await Content.find({
      folderId: folder._id
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      folder,
      subFolders,
      contents,
      hasAccess: false
    });

  } catch (err) {

    console.log('GET FOLDER DETAIL ERROR:', err);

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
      thumbnail
    } = req.body;


    if (!name || !name.trim()) {

      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });

    }


    const folder = new Folder({

      name: name.trim(),

      parentId: parentId || null,

      description: description || '',

      thumbnail: thumbnail || ''

    });


    await folder.save();


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


    if (req.body.name !== undefined) {

      folder.name = req.body.name.trim();

    }


    if (req.body.description !== undefined) {

      folder.description = req.body.description;

    }


    if (req.body.thumbnail !== undefined) {

      folder.thumbnail = req.body.thumbnail;

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


    // Check subfolders
    const childFolders = await Folder.countDocuments({

      parentId: folder._id

    });


    if (childFolders > 0) {

      return res.status(400).json({

        success: false,

        message:
          'Folder contains subfolders. Delete them first.'

      });

    }


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