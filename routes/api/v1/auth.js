/* eslint-disable eol-last */
/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');


const router = express.Router();

// @route   POST api/v1/auth/signup
// @desc    Create user account
// @access  Public
router.post('/signup', (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({ status: 400, email_exist: 'Email already exist, please login' });
    }
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      return res.status(400).json({ status: 400, empty_fields: 'Please fill all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 400, password_length: 'Password must be more than 6 characters' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ status: 400, password_mis_match: 'Passwords do not match' });
    }
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save()
          .then((user) => res.status(200).json({
            status: 200,
            new_user: user,
          })).catch((err) => res.status(400).json({
            status: 400,
            error: err,
          }));
      });
    });
  });
});

// @route   POST api/auth/signin
// @desc    Login a user / Returning JWT Token
// @access  Public
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 400, error: 'Please enter a valid email and password' });
  }
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ status: 404, email_not_found: 'Email does not exist!' });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email,
        };
        jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: 21600000 }, (err, token) => {
          res.status(200).json({
            status: 200,
            token: `Bearer ${token}`,
          });
        });
      } else {
        return res.status(400).json({ status: 400, password_error: 'Password incorrect!' });
      }
    });
  });
});

module.exports = router;