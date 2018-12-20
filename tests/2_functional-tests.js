/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  let id1;
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', () => {


    suite('POST /api/books with title => create book object/expect book object', () => {
      
      test('Test POST /api/books with title', (done) => {
        chai.request(server)
        .post('/api/books')
        .send({title: 'My first book'})
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          id1 = res.body._id;
          done();
        });
      });
      
      test('Test POST /api/books with no title given', (done) =>{
        chai.request(server)
        .post('/api/books')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.equal(res.text, 'Book needs a title.');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', () => {
      
      test('Test GET /api/books',  (done) => {
       chai.request(server)
        .get('/api/books')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', () => {
      
      test('Test GET /api/books/[id] with id not in db',  (done) => {
        chai.request(server)
        .get('/api/books/123456789123')
        .end((err, res) => {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  (done) => {
        chai.request(server)
        .get('/api/books/' + id1)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      
      test('Test POST /api/books/[id] with comment', (done) => {
        chai.request(server)
        .post('/api/books/' + id1)
        .send({comment: 'comment on the book'})
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.isArray(res.body.comments);
          assert.include(res.body.comments, 'comment on the book');
          done();
        });
      });
      
    });

  });

});
