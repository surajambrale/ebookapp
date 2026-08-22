const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '' },
  link: { type: String, default: '' },
  active: { type: Boolean, default: true },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
