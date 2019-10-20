/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  rater_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating_num: {
    type: Number,
    required: true
  },
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;