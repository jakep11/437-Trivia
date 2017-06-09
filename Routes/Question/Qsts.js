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

   if (parseInt(ownerId) !== req.session.id) {
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
      if (vld.hasFields(body, ["title", "categoryId", "answer"], cb) &&
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
   var qst;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Question where id = ?', qstId, cb);
   },
   function(qsts, fields, cb) {
      if (vld.check(qsts.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(qsts[0].ownerId, cb)) {
         if (body.categoryId) {
            qst = qsts[0];
            cnn.chkQry('select * from Category where id = ?', body.categoryId,
             function (err, ctg) {
                if (vld.check(!err && ctg.length, Tags.badValue, ["categoryId"], cb)) {
                   cb();
                }
             });
         }
         else {
            qst = qsts[0];
            cb();
         }
      }
   },
   function(cb) {
      console.log(cb);
      if (vld.chain(!body.title ||
       body.title.length < titleLimit, Tags.badValue, ["title"])
      .chain(!body.answer || body.answer.length < answerLimit, Tags.badValue,
       ["answer"])
      .check(!body.title || qst.title !== body.title, Tags.dupTitle, null, cb)) {
         cnn.chkQry('update Question set ? where id = ?', [body, qst.id], cb);
      }
   }],
   function(err) {
      if (!err) {
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
      if (vld.check(qsts.length, Tags.notFound, null, cb) &&
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
      console.log(159);
      if (vld.check(qsts.length, Tags.notFound, null, cb) &&
       vld.hasFields(body, ["guess"], cb)) {
         // Disregard capitalization
         if (qsts[0].answer.toLowerCase() === body.guess.toLowerCase()) {
            //Query to make sure they didn't already answer
            cnn.chkQry('select * from PersonQuestion where questionId = ?' +
             ' and personId = ?', [parseInt(qstId), req.session.id], cb)
         }
         else {
            res.status(200).end();
            cb("Wrong answer");
         }
      }
   },
   function(anrs, fields, cb) {
      console.log(174);
      // If no answers yet, then insert
      if(!anrs.length) {
         var prsQst = {personId: req.session.id, questionId: parseInt(qstId)};
         //add user and question to correct table
         cnn.chkQry('insert into PersonQuestion set ?', prsQst, cb);
      } else {
         res.status(200).end();
         cb("Already answered");
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
