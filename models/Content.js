const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    // =====================================
    // CONTENT NAME
    // =====================================

    title: {
      type: String,
      required: true,
      trim: true
    },


    // =====================================
    // WHICH FOLDER?
    // =====================================

    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: true
    },


    // =====================================
    // CONTENT TYPE
    // =====================================

    type: {
      type: String,
      enum: [
        'pdf',
        'video',
        'note',
        'image',
        'audio'
      ],
      required: true
    },


    // =====================================
    // FILE URL
    // =====================================

    url: {
      type: String,
      default: ''
    },


    // =====================================
    // THUMBNAIL
    // =====================================

    thumbnail: {
      type: String,
      default: ''
    },


    // =====================================
    // NOTE CONTENT
    // =====================================

    noteContent: {
      type: String,
      default: ''
    },


    // =====================================
    // FILE SIZE
    // =====================================

    fileSize: {
      type: Number,
      default: 0
    },


    // =====================================
    // VIDEO DURATION
    // =====================================

    duration: {
      type: Number,
      default: 0
    },


    // =====================================
    // DISPLAY ORDER
    // =====================================

    order: {
      type: Number,
      default: 0
    },


    // =====================================
    // STATUS
    // =====================================

    active: {
      type: Boolean,
      default: true
    }
  },

  {
    timestamps: true
  }
);

module.exports =
  mongoose.model('Content', contentSchema);