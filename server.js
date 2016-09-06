require( 'dotenv' ).config(); // Toggle comment off for Heroku deploy, on for local dev
var mongodb = require( 'mongodb' );
var mongo = mongodb.MongoClient;
var path = require( 'path' );
var cookieParser = require( 'cookie-parser' );
var express = require( 'express' );
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

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
    
    // initialise passportjs
    passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: "http://nytelyfe.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var User = db.collection('users');
    User.findOrCreate({}, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

    // Standard express setup
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use( express.static( path.join( __dirname, '/public' )));
    
    app.use( '/', require( './routes' ));
  }
  app.set( 'port', ( process.env.PORT || 5000 ));
  app.set( 'views', path.join( __dirname, '/views' ));
  app.set( 'view engine', 'ejs' );
  
  app.listen( app.get( 'port' ), function() {
    console.log( 'Node app is running on port ', app.get( 'port' ) );
    
    });
});