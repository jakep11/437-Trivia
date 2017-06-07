//Jake

var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
 
router.baseURL = '/Ctgs';

router.get('/', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   req.cnn.chkQry('select * from Category', null, 
    function(err, ctgs) {
      if(!err) {
         res.json(ctgs);
      }
    });

});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if(vld.hasFields(body, ["title"], cb) &&
       vld.check(req.body.title.length < 80, Tags.badValue, ["title"], cb)) {
         cnn.chkQry('select * from Category where title = ?', 
          body.title, cb);
      }
   },
   function(existingCtg, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb))
         cnn.chkQry("insert into Conversation set ?", body, cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.get('/:ctgId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var ctgId = req.params.ctgId;

   async.waterfall([
   function(cb) {
      req.cnn.chkQry('select * from Category where id = ?', [ctgId], cb);
   },
   function(ctgs, fields, cb) {
      if (vld.check(ctgs.length, Tags.notFound, null, cb)) {
         req.cnn.chkQry('select Q.id as id, Q.title as title, ownerId, C.title ' +
          'as categoryTitle from Question as Q Join Category as C on ' + 
          'Q.categoryId = C.id where C.id = ?', parseInt(ctgId), cb);
      }
   },
   function(qsts, fields, cb) {
      res.json(qsts);
      cnn.release();
   
   }],
   function(err) {
      cnn.release();
   }); 
});

router.delete('/:ctgId', function(req, res) {
   var vld = req.validator;
   var ctgId = req.params.ctgId;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.check(admin, Tags.noPermission, null, cb)) {
         cnn.chkQry('select * from Category where id = ?', [ctgId], cb);
      }
   },
   function(ctgs, fields, cb) {
      if (vld.check(ctgs.length, Tags.notFound, null, cb))
         cnn.chkQry('delete from Category where id = ?', [ctgId], cb);
   },
   function(nothing, fields, cb) {
      cnn.chkQry('delete from Question where cnvId = ?', [cnvId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});


module.exports = router;
