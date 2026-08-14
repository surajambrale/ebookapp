const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },

    sellingPrice: {
      type: Number,
      default: 0
    },

    offerPrice: {
      type: Number,
      default: 0
    },

    accessDurationDays: {
      type: Number,
      default: 30
    },

    isPremium: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Folder ||
  mongoose.model('Folder', folderSchema);