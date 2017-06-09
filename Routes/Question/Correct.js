//Correct.js
//Jason

var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
 
router.baseURL = 'Qsts/Correct';

router.get('/', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      // Get questions that the user has answered correctly
      cnn.chkQry('select qst.id, qst.title, qst.ownerId, ctg.title as' +
       ' categoryTitle, qst.answer from Question as qst, Category as ctg,' +
       ' PersonQuestion as pq where pq.personId = ? and ctg.id =' +
       ' qst.categoryId and qst.id = pq.questionId;', req.session.id, cb);
   },
   function(answers, fields, cb) {
      res.json(answers);
      cnn.release();
      cb();
   }],
   function(err) {
      console.log(err);
      cnn.release();
   });
});

router.get('/:qstId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var qstId = req.params.qstId;

   async.waterfall([
   function(cb) {
      req.cnn.chkQry('select * from PersonQuestion where questionId = ? and' +
       ' personId = ?', [parseInt(qstId), req.session.id], cb);
   },
   function(qsts) {
      res.json({correct : qsts.length > 0});
      cnn.release();
   }],
   function(err) {
      console.log(err);
      cnn.release();
   }); 
});

module.exports = router;