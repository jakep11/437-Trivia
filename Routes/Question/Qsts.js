//Alexis
var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Qsts';


// return questions with owner specified or current AU
router.get('/', function(req, res) {
   var cnn = req.cnn;
   var ownerId = req.query.owner || req.session.id;

   if (ownerId !== req.session.id) {
      cnn.chkQry('select q.id, ownerId, c.title as category, q.title from' +
       ' Question as q ' +
       'inner join Category as c on q.categoryId = c.id where ownerId = ?',
       ownerId,
      function(err, qsts) {
         if(!err) {
            res.json(qsts);
         }
         cnn.release();
      });
   }
   else {
      cnn.chkQry('select q.id, ownerId, c.title as category, q.title,' +
       ' q.answer from Question as q ' +
       'inner join Category as c on q.categoryId = c.id where ownerId = ?',
      ownerId,
      function(err, qsts) {
         if(!err) {
            res.json(qsts);
         }
         cnn.release();
      });
   }
});

// add a new question with the owner as the current AU
router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var titleLimit = 500, answerLimit = 100;

   async.waterfall([
   function(cb) {
      if(vld.hasFields(body, ["title", "categoryId", "answer"], cb) &&
       vld.chain(body.answer.length < answerLimit, Tags.badValue, ["answer"])
       .check(body.title.length < titleLimit, Tags.badValue, ["title"], cb)) {
         cnn.chkQry('select * from Question where title = ?',
          body.title, cb);
      }
   },
   function(existingQst, fields, cb) {
      body.ownerId = req.session.id;
      if (vld.check(!existingQst.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry("insert into Question set ?", body, cb);
      }
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

// edit specific question, must be owner or Admin
router.put('/:qstId', function(req, res) {
   var body = req.body;
   var cnn = req.cnn;
   var vld = req.validator;
   var qstId = req.params.qstId;
   var titleLimit = 500, answerLimit = 100;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Question where id = ?', qstId,
       function(err, qst) {
         if(!err && vld.check(qst.length, Tags.notFound)) {
            cb(qst[0]);
         }
       });
   },
   function(qst, cb) {
      if (vld.checkPrsOK(qst.ownerId, cb) &&
       vld.check(body.categoryId, null, null, cb)) {
         cnn.chkQry('select * from Category where id = ?', body.categoryId,
         function(err, ctg) {
            if(!err && vld.check(ctg.length, Tags.badValue, ["categoryId"], cb)) {
               cb(qst);
            }
         });
      }
   },
   function(qst, cb) {
      if (vld.chain(!body.title ||
       body.title < titleLimit, Tags.badValue, ["title"])
      .chain(!body.answer || body.answer < answerLimit, Tags.badValue,
       ["answer"])
      .check(!body.title || qst.title !== body.title, Tags.dupTitle, null, cb)) {
         cnn.chkQry('update Question set ? where id = ?', [body, qst.id], cb);
      }
   }],
   function(err) {
      if(!err) {
         res.status(200).end();
      }
      cnn.release();
   });
});

// delete specific question if AU is owner or admin
router.delete('/:qstId', function(req, res) {
   var vld = req.validator;
   var qstId = req.params.qstId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Question where id = ?', qstId, cb);
   },
   function(qsts, fields, cb) {
      if(vld.check(qsts.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(qsts[0].id, cb)) {
         cnn.chkQry('delete from Question where id = ?', qstId, cb);
      }
   }],
   function(err){
      if(!err) {
         res.status(200).end();
      }
      cnn.release();
   });
});

// submit guess to question, if correct add user to PersonQuestion table
router.post('/:qstId/Answers', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var body = req.body;
   var qstId = req.params.qstId;

   async.waterfall([
   function(cb) {
      //get question
      cnn.chkQry('select * from Question where id = ?', qstId, cb);
   },
   function(qsts, fields, cb) {
      //check if question exists
      if(vld.check(qsts.length, Tags.notFound, cb) &&
       vld.hasFields(body, ["answer"], cb) &&
       vld.check(qsts[0].answer === body.answer, null, null, cb)) {
         //add user and question to correct table
         cnn.chkQry('insert into PersonQuestion (personId, questionId)' +
          ' values(?,?)', [req.session.id, qstId], cb);
      }
   }],
   function(err) {
      if(!err) {
         res.status(200).end();
      }
      cnn.release();
   });
});

module.exports = router;
