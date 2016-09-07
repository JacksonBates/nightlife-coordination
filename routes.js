var express = require( 'express' );
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mongodb = require( 'mongodb' );
var yelp = require( './controllers/apiCall.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// var userQueries = require( './controllers/userQueries' );

// Homepage for the app, 
router.get( '/', function( req, res ) {
  res.render( 'pages/index' );
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));

router.post( '/search', function( req, res ) {
  var loc = req.body.location;
  var params = { location: loc, sort: 2 };
  yelp(params, function( error, response, body ) {
    if ( error ) {
      console.log( error );
    } else {
      var json = JSON.parse( body );
      console.log( json.businesses[0].name );
      res.render( 'pages/whats-on', { json: json } );  
    }
  });
  
});

router.get ( '/whats-on', function( req, res ) {
  res.render( 'pages/whats-on' );
});

module.exports = router;