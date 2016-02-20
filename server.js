var express = require('express');
var fs = require('fs');
var request = require('request');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var phantom = require('phantom');
var MongoClient = require('./mongodb');
var ObjectID = require('mongodb').ObjectID;

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res, next) {
    if (!req.cookies.apitycID) {
      MongoClient(function(err, db) {
        db.collection('apiCollection').insert({}, function(err, doc) {
          var uniqueID = doc.ops[0]._id;
          res.cookie('apitycID', uniqueID);
          res.send(fs.readFileSync(__dirname + '/index.html', 'utf8'));
          db.close();
        });
      });
    } else if(req.cookies.apitycID) {
      MongoClient(function(err, db) {
        var objID = new ObjectID(req.cookies.apitycID);
        db.collection('apiCollection').findOne({_id: objID}, function(err, result) {
          console.log(result);
          res.send(fs.readFileSync(__dirname + '/index.html', 'utf8'));
          db.close();
        })
     });
    } else {
      res.send(fs.readFileSync(__dirname + '/index.html', 'utf8'));
    }
});




app.post('/apireq/get.stf', function(req, res, next) {
    res.cookie('website', req.body.website);
    res.send();
});

app.get('/gogetberk/hi.htx', function(req, res, next) {
  // console.log(req.cookies.website);
  
  phantom.create().then(function(ph) {
     ph.createPage().then(function(page) {
       page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
       page.open(req.cookies.website).then(function(status) {
         page.property('content').then(function(content) {
           res.send(content);
           page.close();
           ph.exit();
         });
       });
     });
   });
 
});

app.get('/gogetberk/*', function(req, res, next) { 
  res.redirect(req.cookies.website + '/' + req.originalUrl.slice(10));
});

app.get('/tycooned/:id', function(req, res, next) {
  var id = new ObjectID(req.params.id);
  
  MongoClient(function(err, db) {
    db.collection('apiCollection').findOne({_id: id}, function(err, result) {
        if (result) {
          res.sendStatus(200);
        } else {
        res.sendStatus(404);
        }
        
      db.close();
    });
  })
});

app.get('*', function(req, res, next) {  
  res.redirect(req.cookies.website + req.originalUrl);
});


app.listen(4000);