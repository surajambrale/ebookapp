const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

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