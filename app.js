var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    boc_api = require('./boc_api'),
    fs = require('fs');

// Create global app object
var app = express();

boc_api.init();

var conf_txt = fs.readFileSync('firebase.conf', 'utf8');
var config=JSON.parse(conf_txt);
firebase = require('firebase')
firebase.initializeApp(config);
app.use(cors());

var transfersRef = firebase.database().ref("transfers");
transfersRef.once("value", function(snapshot) {
  var transactions = new Array();
  snapshot.forEach(function(userSnapshot) {
    if (userSnapshot.val().payment_data.debtor.accountId === "351012345671") {
       transactions.push(userSnapshot.val());
    }
  });
  console.log(transactions.length);
});

app.set('view engine', 'ejs');

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

app.use("/", require("./routes/index"));
app.use("/bocOauthcb", require("./routes/boc_callback"));
app.use(express.static('public'))


/// error handlers

  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
