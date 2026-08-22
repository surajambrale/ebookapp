const FolderAccess = require('../models/FolderAccess');
const Folder = require('../models/Folder');
const Subscription = require('../models/Subscription');
const Content = require('../models/Content');

const isSubscriptionActive = async (userId) => {
  if (!userId) return false;

  const subscription = await Subscription.findOne({
    userId: String(userId),
    status: 'active',
    expiryDate: { $gt: new Date() }
  });

  return !!subscription;
};

const checkFolderAccess = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { folderId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        hasAccess: false,
        message: 'Authentication required'
      });
    }

    if (!folderId) {
      return res.status(400).json({
        success: false,
        hasAccess: false,
        message: 'Folder ID required'
      });
    }

    const subscriptionActive = await isSubscriptionActive(userId);

    const access = await FolderAccess.findOne({
      user: userId,
      folder: folderId,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    return res.json({
      success: true,
      hasAccess: subscriptionActive || !!access,
      subscriptionActive,
      access: access || null
    });
  } catch (error) {
    console.error('CHECK FOLDER ACCESS ERROR:', error);
    return res.status(500).json({
      success: false,
      hasAccess: false,
      message: 'Failed to check folder access'
    });
  }
};

const grantFolderAccess = async (req, res) => {
  try {
    const { userId, folderId, durationDays = 30 } = req.body;

    if (!userId || !folderId) {
      return res.status(400).json({
        success: false,
        message: 'User and folder are required'
      });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    const days = Number(durationDays) > 0 ? Number(durationDays) : 30;
    expiryDate.setDate(expiryDate.getDate() + days);

    let access = await FolderAccess.findOne({
      user: userId,
      folder: folderId
    });

    if (access) {
      access.startDate = startDate;
      access.expiryDate = expiryDate;
      access.accessType = 'admin';
      access.amount = 0;
      access.paymentId = 'admin_manual';
      access.orderId = 'admin_manual';
      access.couponCode = '';
      access.isActive = true;
      await access.save();
    } else {
      access = await FolderAccess.create({
        user: userId,
        folder: folderId,
        accessType: 'admin',
        amount: 0,
        paymentId: 'admin_manual',
        orderId: 'admin_manual',
        startDate,
        expiryDate,
        isActive: true
      });
    }

    return res.json({
      success: true,
      message: 'Folder access granted successfully',
      access
    });
  } catch (error) {
    console.error('GRANT FOLDER ACCESS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to grant folder access'
    });
  }
};

const getUserFolderAccess = async (req, res) => {
  try {
    const accesses = await FolderAccess.find({
      user: req.params.userId,
      expiryDate: { $gt: new Date() },
      isActive: true
    })
      .populate('folder', 'name description sellingPrice offerPrice parentId')
      .sort({ createdAt: -1 });

    return res.json({ success: true, accesses });
  } catch (error) {
    console.error('GET USER FOLDER ACCESS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get folder access'
    });
  }
};

const getMyFolderAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptionActive = await isSubscriptionActive(userId);
    const activeAccesses = await FolderAccess.find({
      user: userId,
      isActive: true,
      expiryDate: { $gt: new Date() }
    })
      .populate('folder', 'name description sellingPrice offerPrice parentId')
      .sort({ createdAt: -1 });

    if (!subscriptionActive) {
      return res.json({
        success: true,
        subscriptionActive: false,
        accesses: activeAccesses.filter(access => access.accessType === 'purchase')
      });
    }

    const folders = await Folder.find({})
      .select('name description sellingPrice offerPrice parentId')
      .sort({ createdAt: -1 });
    const accessByFolder = new Map(
      activeAccesses.map(access => [String(access.folder?._id), access])
    );
    const accesses = folders.map(folder => accessByFolder.get(String(folder._id)) || {
      folder,
      accessType: 'subscription',
      amount: 0,
      startDate: new Date(),
      expiryDate: null,
      isActive: true
    });

    return res.json({ success: true, subscriptionActive: true, accesses });
  } catch (error) {
    console.error('GET MY FOLDER ACCESS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

const getFolderDetails = async (req, res) => {
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

    const subFolders = await Folder.find({
      parentId: folder._id
    }).sort({ createdAt: -1 });

    const sellingPrice = Number(folder.sellingPrice) || 0;
    const offerPrice = Number(folder.offerPrice) || 0;
    const finalPrice =
      offerPrice > 0 && offerPrice < sellingPrice
        ? offerPrice
        : sellingPrice;

    const subscriptionActive = await isSubscriptionActive(userId);

    const access = await FolderAccess.findOne({
      user: userId,
      folder: folder._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    const hasAccess = subscriptionActive || !!access;

    // Metadata can be shown on the page, but protected content URLs
    // should not be exposed until the user has valid access.
    const rawContents = await Content.find({
      folderId: folder._id,
      active: true
    }).sort({ createdAt: -1 });

    const contents = hasAccess
      ? rawContents
      : rawContents.map(item => {
          const obj = item.toObject();
          delete obj.url;
          delete obj.noteContent;
          return obj;
        });

    return res.json({
      success: true,
      folder,
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
  } catch (error) {
    console.error('GET FOLDER DETAILS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load folder'
    });
  }
};

module.exports = {
  checkFolderAccess,
  grantFolderAccess,
  getUserFolderAccess,
  getMyFolderAccess,
  getFolderDetails,
  isSubscriptionActive
};
