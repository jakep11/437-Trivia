var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');

var async = require('async');

var app = express();

// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

// Parse all request bodies using JSON
app.use(bodyParser.json());

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

// Check general login.  If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function(req, res, next) {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
    (req.path === '/Prss' || req.path === '/Ssns'))) {
      req.validator = new Validator(req, res);
      next();
   } else
      res.status(401).end();
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Prss', require('./Routes/Account/Prss'));
app.use('/Ssns', require('./Routes/Account/Ssns'));
app.use('/Correct', require('./Routes/Question/Correct.js'));
app.use('/Ctgs', require('./Routes/Question/Ctgs.js'));
app.use('/Qsts', require('./Routes/Question/Qsts.js'));

// Special debugging route for /DB DELETE.  Clears all table contents, resets 
// all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function(req, res) {

   // Callbacks to clear tables
   var cbs = ["PersonQuestion", "Category", "Question", 
    "Person"].map(function(tblName) {
      return function(cb) {
         req.cnn.query("delete from " + tblName, cb);
      };
   });

   // Callbacks to reset increment bases
   cbs = cbs.concat(["PersonQuestion", "Category", "Question", "Person"]
    .map(function(tblName) {
      return function(cb) {
         req.cnn.query("alter table " + tblName + " auto_increment = 1", cb);
      };
   }));

   // Callback to reinsert admin user
   cbs.push(function(cb) {
      req.cnn.query('INSERT INTO Person (firstName, lastName, email,' +
          ' password, whenRegistered, role) VALUES ' +
          '("Joe", "Admin", "adm@11.com","password", NOW(), 1);', cb);
   });

   // Callback to clear sessions, release connection and return result
   cbs.push(function(callback){
      for (var session in Session.sessions)
         delete Session.sessions[session];
      callback();
   });

   if (!req.session.isAdmin()) {
      res.status(403).end();
   }
   else {
      async.series(cbs, function(err, status) {
      
      if (err)
         res.status(400).json(err);
      else
         res.status(200).end();
      });
      
   }
   req.cnn.release();
});

// Handles if not caught by other endpoints
//Sends a 404 Not found error
app.use(function(req, res, next) {
   res.status(404).end();
   req.cnn.release();
});

// Get -p commandline parameter or set default port to 3031
function getPortNum() {
   var portNum = 3031;
   var getPort = false;
   
   process.argv.forEach(function (val, index, array) {
      if (val === "-p") {
         getPort = true;
      }
      else if (getPort) {
         portNum = val;
         getPort = false;
      }
   });  
   return portNum;
}

app.listen(getPortNum(), function () {
   console.log('App Listening on port ' + getPortNum());
});
