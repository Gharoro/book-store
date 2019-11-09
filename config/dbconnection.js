/* eslint-disable global-require */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');
const Book = require('../models/Book');

const NODE_ENV = 'test';

function connect() {
  return new Promise((resolve, reject) => {
    if (NODE_ENV === 'test') {
      mongoose.connect(process.env.PROD_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }).then((res, err) => {
        if (err) return reject(err);
        resolve();
      });
    } else if (process.env.NODE_ENV === 'development') {
      mongoose.connect(process.env.DEV_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }).then((res, err) => {
        if (err) return reject(err);
        resolve();
      });
      mongoose.connection
        .once('open', () => console.log('Connected to database...'))
        .on('error', (error) => console.log('Error connecting to database!', error));
    } else {
      mongoose.connect(process.env.PROD_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }).then((res, err) => {
        if (err) return reject(err);
        resolve();
      });
    }
  });
}

function close() {
  return mongoose.disconnect();
}

function dropCollection() {
  Book.deleteMany({}).then(() => {
    console.log('Collection dropped');
  }).catch((err) => console.log(err));
}

module.exports = { connect, close, dropCollection };
