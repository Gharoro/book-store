/* eslint-disable eol-last */
/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const multer = require('multer');

const data = multer();

const Book = require('../../../models/Book');
const User = require('../../../models/User');
const parser = require('../../../config/upload');

const { ObjectId } = mongoose.Types;

const router = express.Router();

// @route   POST /book
// @desc    Add a new book to the store
// @access  Private
router.post('/', parser.single('image'), passport.authenticate('jwt', { session: false }), (req, res) => {
  const { title, description, author, publisher, genre } = req.body;
  const posted_by = `${req.user.first_name} ${req.user.last_name}`;
  const poster_id = req.user.id;
  let image = req.file;
  if (!title || !description || !author || !publisher || !genre) {
    return res.status(400).json({ status: 400, empty_fields: 'Please fill all fields' });
  }
  if (!image) {
    return res.status(400).json({ status: 400, no_img: 'Please upload an image for your book' });
  }
  if (image.size > 2000000) {
    return res.status(400).json({ status: 400, img_size: 'Please upload a picture less than 2mb' });
  }
  image = {
    public_id: image.public_id,
    public_url: image.url,
  };
  User.findById(req.user.id).then((user) => {
    const newBook = new Book({
      title, description, author, publisher, genre, posted_by, poster_id, image,
    });
    user.books.push(newBook);
    user.save().then(() => {
      newBook.save().then((book) => res.status(200).json({
        status: 200,
        added_book: book,
      })).catch(() => res.status(400).json({
        status: 400,
        error: 'Unable to add book at the moment',
      }));
    }).catch((err) => res.status(400).json({ status: 400, error: err }));
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// // @route   GET /book
// // @desc    View all books
// // @access  Public
router.get('/', (req, res) => {
  Book.aggregate([{
    $project:
    {
      title: 1,
      description: 1,
      author: 1,
      publisher: 1,
      genre: 1,
      posted_by: 1,
      image: 1,
      ratingAvg: { $avg: '$ratings' },
    },
  }]).then((books) => {
    if (books.length > 0) {
      return res.status(200).json({
        status: 200,
        books,
      });
    }
    res.status(404).json({ status: 404, error: 'There are currently no books.' });
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /:book_id
// @desc    View a specific book
// @access  Public
router.get('/:book_id', (req, res) => {
  const { book_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(book_id)) {
    res.status(404).json({ status: 404, error: 'Invalid Book Id' });
  }
  Book.aggregate([
    { $match: { _id: ObjectId(book_id) } },
    {
      $project:
      {
        title: 1,
        description: 1,
        author: 1,
        publisher: 1,
        genre: 1,
        posted_by: 1,
        image: 1,
        ratingAvg: { $avg: '$ratings' },
      },
    },
  ]).then((book) => {
    if (book.length > 0) {
      return res.status(200).json({
        status: 200,
        book,
      });
    }
    res.status(404).json({ status: 404, error: 'Book not found.' });
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   PATCH /:book_id
// @desc    Update a book
// @access  Private
router.patch('/:book_id', data.none(), passport.authenticate('jwt', { session: false }), (req, res) => {
  const { book_id } = req.params;
  let { title, description, author, publisher, genre } = req.body;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(book_id)) {
    return res.status(404).json({ status: 404, error: 'Invalid Book Id' });
  }
  Book.findById(book_id).then((book) => {
    title = (!title) ? book.title : title;
    description = (!description) ? book.description : description;
    author = (!author) ? book.author : author;
    publisher = (!publisher) ? book.publisher : publisher;
    genre = (!genre) ? book.genre : genre;
    if (!book) {
      return res.status(404).json({ status: 404, error: 'Book does not exist' });
    }
    if (current_user_id !== (book.poster_id).toString()) {
      res.status(401).json({ status: 401, error: 'Not Authorized' });
    } else {
      Book.updateOne(
        { _id: book_id },
        { $set: { title, description, author, publisher, genre } },
      ).then(() => res.status(200).json({
        status: 200,
        message: 'Book updated successfuly',
      })).catch((err) => res.status(400).json({ status: 400, error: err }));
    }
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   DELETE /:car_id
// @desc    Delete a specific car
// @access  Private
router.delete('/:book_id/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { book_id } = req.params;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(book_id)) {
    res.status(404).json({ status: 404, error: 'Invalid book Id' });
  }
  Book.findById(book_id).then((book) => {
    const book_img_id = book.image[0].public_id;
    if (!book) {
      return res.status(404).json({ status: 404, no_car: 'Book does not exist' });
    }
    if (current_user_id === (book.poster_id).toString()) {
      Book.deleteOne({ _id: book_id }).then(() => {
        cloudinary.v2.uploader.destroy(book_img_id, () => {
          res.status(200).json({
            status: 200,
            message: 'Book deleted successfuly',
          });
        });
      }).catch((err) => res.status(400).json({ status: 400, error: err }));
    } else {
      res.status(401).json({ status: 401, not_allowed: 'Not Authorized' });
    }
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});


module.exports = router;