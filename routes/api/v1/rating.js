/* eslint-disable eol-last */
/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const Rating = require('../../../models/Rating');
const Book = require('../../../models/Book');


const router = express.Router();

// @route   POST /rating
// @desc    Add a rating for a book
// @access  Private
router.post('/:book_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { rating_num } = req.body;
  const { book_id } = req.params;
  const rater_id = req.user.id;
  if (!rating_num) {
    return res.status(400).json({ status: 400, no_rating_num: 'Please enter a rating value' });
  }
  if (rating_num > 5) {
    return res.status(400).json({ status: 400, invalid: 'Maximum rating value is 5' });
  }
  if (!mongoose.Types.ObjectId.isValid(book_id)) {
    res.status(404).json({ status: 404, error: 'Invalid book Id' });
  }
  Book.findById(book_id).then((book) => {
    if (!book) {
      return res.status(404).json({ status: 404, error: 'Book does not exist' });
    }
    Rating.findOne({ rater_id, book_id }).then((rating) => {
      if (rating) {
        return res.status(401).json({ status: 401, error: 'You already rated this book' });
      }
      const newRating = new Rating({ book_id, rater_id, rating_num });
      book.ratings.push(newRating.rating_num);
      book.save().then(() => {
        newRating.save().then(() => res.status(200).json({
          status: 200,
          message: 'Thank you for your rating.',
        })).catch(() => res.status(400).json({ status: 400, error: 'Unable to rate book at the moment' }));
      }).catch((err) => res.status(400).json({ status: 400, error: err }));
    });
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

module.exports = router;