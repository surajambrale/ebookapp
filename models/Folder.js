const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    // null = Main/Root folder
    // ObjectId = kisi folder ke andar ka subfolder
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },

    description: {
      type: String,
      default: ''
    },

    thumbnail: {
      type: String,
      default: ''
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    },
    sellingPrice: {
      type: Number,
      default: 0
    },

    offerPrice: {
      type: Number,
      default: 0
    },

    isPaid: {
      type: Boolean,
      default: false
    },

    accessDurationDays: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Folder', folderSchema);