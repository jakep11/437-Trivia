//Jake

var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
 
router.baseURL = '/Msgs';

router.get('/:msgId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var msgId = req.params.msgId;

   async.waterfall([
   function(cb) {
      req.cnn.chkQry('select UNIX_TIMESTAMP(whenMade) * 1000 as whenMade,' +
       ' email, content from Message join Person on Message.prsId =' +
       ' Person.id where Message.id = ?', parseInt(msgId), cb);
   },
   function(msgs, fields, cb) {
      if (vld.check(msgs.length, Tags.notFound, null, cb)) {
      		res.json(msgs[0]);
          cnn.release();
      }
   
   }],
   function(err) {
      cnn.release();
   }); 
});

module.exports = router;
