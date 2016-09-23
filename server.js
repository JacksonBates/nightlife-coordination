require( 'dotenv' ).config(); // Toggle comment off for Heroku deploy, on for local dev
var mongodb = require( 'mongodb' );
var mongo = mongodb.MongoClient;
var path = require( 'path' );
var cookieParser = require( 'cookie-parser' );
var expressSession = require( 'express-session' );
var express = require( 'express' );
var app = express();
var bodyParser = require('body-parser');
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var SparkPost = require('sparkpost');
var client = new SparkPost();

var mongoUserPsw = process.env.MONGO_USR_PSW;
var url = 'mongodb://' + mongoUserPsw +   "@ds019076.mlab.com:19076/nytelyfe";


mongo.connect( url, function( err, db ) {
  if ( err ) {
    console.log( 'Error: Could not connect to DB' );
  } else {
    console.log( 'Success: Connected to DB' );
 
    app.use( function( req, res, next ) {
      req.db = db;
      next();
    });
    
    // TODO: MongoDB setup (given default can be used)
    var pathToMongoDb = url;
    var sendingDomain = process.env.SENDING_DOMAIN;

    // Path to be sent via email
    var host = 'https://nytelyfe.herokuapp.com/';

    // Setup of Passwordless
    passwordless.init(new MongoStore(pathToMongoDb));
    passwordless.addDelivery(
        function(tokenToSend, uidToSend, recipient, callback) {
            var tokenLink = host + '?token=' + tokenToSend + '&uid=' + encodeURIComponent(uidToSend);
            // Send out token with SparkPost
            client.transmissions.send({
              transmissionBody: {
                content: {
                  from: sendingDomain,
                  subject: 'Token for ' + host,
                  html: "<html>Hello!\nYou can now access your account here: <a href='" + tokenLink + "'>" + tokenLink + "</a></html>"
                },
                recipients: [
                  {address: recipient}
                ]
              }
            }, function(err, res) {
              if (err) {
                console.log(err);
              } else {
                console.log('Email successfully sent via SparkPost to ' + recipient);
                callback();
            }
        });
        })

    // Standard express setup
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(expressSession({secret: '42', saveUninitialized: false, resave: false, cookie: { maxAge: 60*60*24*365*10 }}));
    app.use( express.static( path.join( __dirname, '/public' )));
    
    // Passwordless middleware
    app.use(passwordless.sessionSupport());
    app.use(passwordless.acceptToken({ enableOriginRedirect: true }));

    app.use( '/', require( './routes' ));
  }
  app.set( 'port', ( process.env.PORT || 5000 ));
  app.set( 'views', path.join( __dirname, '/views' ));
  app.set( 'view engine', 'ejs' );
  
  app.listen( app.get( 'port' ), function() {
    console.log( 'Node app is running on port ', app.get( 'port' ) );
    
    });
});