/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  ratings: [{
    type: Number,
    ref: 'Rating'
  }],
  posted_by: {
    type: String,
    ref: 'User'
  },
  poster_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  image: [
    {
      public_id: String,
      public_url: String
    }
  ],
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
