/* eslint-disable eol-last */
/* eslint-disable no-console */
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Cors middleware
app.use(cors());

// Environment variable middleware
require('dotenv').config();

// Database connection
const db = require('./config/dbconnection');

db.connect();

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route Files
const auth = require('./routes/api/v1/auth');
const book = require('./routes/api/v1/book');
const rating = require('./routes/api/v1/rating');

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Home Page
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Welcome to the Book store API',
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use Routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/book', book);
app.use('/api/v1/rating', rating);

const port = process.env.PORT || 2000;
const server = app.listen(port, () => console.log(`App running on port ${port}`));

module.exports = { app, server };