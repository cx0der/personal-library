/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const COLLECTION = 'books';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = (app) => {

  app.route('/api/books')
    .get((req, res) => {
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if(err) {
          res.status(503).send('Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).find({}).toArray((err, docs) => {
          if (err) {
            res.status(503).send(`Error getting books ${err}`);
          } else {
            for(let i = 0; i < docs.length; i++) {
              docs[i].commentcount = docs[i].comments.length;
              delete docs[i].comments;
            }
            res.json(docs);
          }
        });
      });
    })

    .post((req, res) => {
      const title = req.body.title;
      if (!title) {
        res.status(401).send('Book needs a title.');
        return;
      }
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if (err) {
          res.status(503).send('Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).insertOne({title: title, comments: []}, (err, r) => {
          client.close();
          res.status(201).json({
            _id: r.insertedId,
            title: title
          });
        });
      });
    })

    .delete((req, res) => {
      //if successful response will be 'complete delete successful'
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if (err) {
          res.status(503).send('Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).deleteMany({}, (err, r) => {
          if (err) {
            res.status(503).send('Service Unavailable');
          } else {
            res.status(204).send('complete delete successful');
          }
          client.close();
        });
      });
    });

  app.route('/api/books/:id')
    .get((req, res) => {
      const bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        res.status(401).send('Invalid book id');
        return;
      }
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if (err) {
          res.status(503).send('Service Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).find({_id: new ObjectId(bookid)}).toArray((err, r) => {
          if(err) {
            res.status(503).send('Service Unavailable');
          } else {
            if(r.length == 0) {
              res.status(404).send('no book exists');
            } else {
              res.json(r[0]);
            }
          }
          client.close();
        });
      });
    })

    .post((req, res) => {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!ObjectId.isValid(bookid)) {
        res.status(401).send('Invalid book id');
        return;
      }
      if(!comment) {
        res.status(401).send('Comment is missing');
        return;
      }
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if(err) {
          res.status(503).send('Service Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).findOneAndUpdate({_id: new ObjectId(bookid)},
                                                {$push: {comments: comment}}, 
                                                {returnOriginal: false}, (err, doc) => { 
          if (err) {
            res.status(503).send('Service Unavailable');
          } else {
            res.status(201).json(doc.value);
          }
          client.close();
        });
      });
    })

    .delete((req, res) => {
      const bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!ObjectId.isValid(bookid)) {
        res.status(401).send('Invalid book id');
        return;
      }
      const client = MongoClient(process.env.DB, { useNewUrlParser: true });
      client.connect((err) => {
        if(err) {
          res.status(503).send('Service Unavailable');
          return;
        }
        const db = client.db();
        db.collection(COLLECTION).deleteOne({_id: new ObjectId(bookid)}, (err, r) => {
          if(err) {
            res.status(503).send('Service Unavailable');
          } else {
            res.status(204).send('Delete successful.');
          }
          client.close();
        });
      });
    });
};
