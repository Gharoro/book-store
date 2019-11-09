/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable eol-last */
const request = require('supertest');

const { app, server } = require('../app');
const db = require('../config/dbconnection');

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkYzJjODk0OTI2OGMzMWJiMDU4MzAyYSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIiwiZW1haWwiOiJqb2huZG9lQGVtYWlsLmNvbSIsImlhdCI6MTU3MzMxODcwMCwiZXhwIjoxNTk0OTE4NzAwfQ.R0B4kIhDX9PJSJIPohFTT9Lv8gP0AAjKNXVOCZYE16Y';

beforeEach(() => {
  // db.dropCollection();
  jest.setTimeout(120000);
  db.connect();
});
afterAll(() => {
  db.close();
  server.close();
});

describe('Book Endpoints', () => {
  // create new book
  it('should create a new book', async () => {
    const res = await request(app)
      .post('/api/v1/book/')
      .set('Authorization', token)
      .field('title', 'New Travis Book 33')
      .field('description', 'Jest is cool')
      .field('author', 'John Doey')
      .field('publisher', 'MacMillian')
      .field('genre', 'comp sci')
      .attach('image', 'tests/attachments/birthday.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
  // fetch all books
  it('should return a list of books', async () => {
    const res = await request(app)
      .get('/api/v1/book/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('books');
  });
  // fetch single book
  it('should return a book matching the passed Id', async () => {
    const book_id = '5dc2efd947c479249cd56432';
    const res = await request(app)
      .get(`/api/v1/book/${book_id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book found');
    expect(res.body).toHaveProperty('book');
  });
  // update a book
  it('should update a book', async () => {
    const book_id = '5dc2efd947c479249cd56432';
    const res = await request(app)
      .patch(`/api/v1/book/${book_id}`)
      .set('Authorization', token)
      .field('title', 'Travis Updated Book')
      .field('description', 'Jest is super cool')
      .field('author', 'John Doey')
      .field('publisher', 'MacMillian')
      .field('genre', 'comp sci');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book updated successfuly');
  });
  // delete a book
  it('should delete a book', async () => {
    const book_id = '5dc2ef8855522f2e702f760c';
    const res = await request(app)
      .delete(`/api/v1/book/${book_id}/delete`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book deleted successfuly');
  });
});