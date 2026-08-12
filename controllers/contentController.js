const Content = require('../models/Content');
const Folder = require('../models/Folder');

// =====================================
// CREATE NOTE
// =====================================

exports.createNote = async (req, res) => {

    try {

        const {
            title,
            folderId,
            noteContent
        } = req.body;


        // Check folder

        const folder = await Folder.findById(folderId);

        if (!folder) {

            return res.status(404).json({

                success: false,
                message: "Folder not found"

            });

        }


        const content = new Content({

            title,

            folderId,

            type: "note",

            noteContent

        });


        await content.save();


        res.json({

            success: true,

            message: "Note created successfully",

            content

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


// =====================================
// GET CONTENTS INSIDE FOLDER
// =====================================

exports.getFolderContents = async (req, res) => {

    try {

        const { folderId } = req.params;


        const contents = await Content.find({

            folderId,

            active: true

        })
        .sort({

            order: 1,
            createdAt: 1

        });


        res.json({

            success: true,

            contents

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


// =====================================
// DELETE CONTENT
// =====================================

exports.deleteContent = async (req, res) => {

    try {

        const { id } = req.params;


        const content =
            await Content.findByIdAndDelete(id);


        if (!content) {

            return res.status(404).json({

                success: false,
                message: "Content not found"

            });

        }


        res.json({

            success: true,

            message: "Content deleted successfully"

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};