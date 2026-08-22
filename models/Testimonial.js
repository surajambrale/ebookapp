const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  name: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  imageUrl: {
    type: String,
    default: ''
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Testimonial',
  testimonialSchema
);