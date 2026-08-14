const mongoose = require('mongoose');

const folderAccessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: true
    },

    accessType: {
      type: String,
      enum: [
        'purchase',
        'admin',
        'subscription'
      ],
      default: 'purchase'
    },

    amount: {
      type: Number,
      default: 0
    },

    paymentId: {
      type: String,
      default: ''
    },

    orderId: {
      type: String,
      default: ''
    },

    couponCode: {
      type: String,
      default: ''
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

folderAccessSchema.index(
  {
    user: 1,
    folder: 1
  },
  {
    unique: true
  }
);

module.exports =
  mongoose.models.FolderAccess ||
  mongoose.model(
    'FolderAccess',
    folderAccessSchema
  );