const Content = require('../models/Content');
const Folder = require('../models/Folder');
const FolderAccess = require('../models/FolderAccess');
const Subscription = require('../models/Subscription');

const hasFolderAccess = async (userId, folderId) => {
    if (!userId) return false;

    const subscription = await Subscription.findOne({
        userId: String(userId),
        status: 'active',
        expiryDate: { $gt: new Date() }
    });

    if (subscription) return true;

    const access = await FolderAccess.findOne({
        user: userId,
        folder: folderId,
        isActive: true,
        expiryDate: { $gt: new Date() }
    });

    return !!access;
};

exports.createNote = async (req, res) => {
    try {
        const { title, folderId, noteContent } = req.body;

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        const content = await Content.create({
            title,
            folderId,
            type: 'note',
            noteContent
        });

        return res.json({
            success: true,
            message: 'Note created successfully',
            content
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getFolderContents = async (req, res) => {
    try {
        const { folderId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        const allowed = await hasFolderAccess(userId, folderId);

        const contents = await Content.find({
            folderId,
            active: true
        }).sort({ order: 1, createdAt: 1 });

        if (!allowed) {
            const lockedContents = contents.map(item => {
                const obj = item.toObject();
                delete obj.url;
                delete obj.noteContent;
                return obj;
            });

            return res.json({
                success: true,
                hasAccess: false,
                contents: lockedContents
            });
        }

        return res.json({
            success: true,
            hasAccess: true,
            contents
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        return res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
