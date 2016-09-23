var express = require( 'express' );
var router = express.Router();
var request = require( 'request' );
var bodyParser = require( 'body-parser' );
var urlencodedParser = bodyParser.urlencoded( { extended: false });
var mongodb = require( 'mongodb' );
var yelp = require( './controllers/apiCall.js' );
var passwordless = require( 'passwordless' );


// var userQueries = require( './controllers/userQueries' );

// Homepage for the app, 
router.get( '/', function( req, res ) {
  res.render( 'pages/index', { user: req.user } );
});

router.get( '/search', function( req, res ) {
  var db = req.db;
  var loc = req.query.location;
  var params = { location: loc, sort: 2 };
  yelp(params, function( error, response, body ) {
    if ( error ) {
      console.log( error );
    } else {
      var json = JSON.parse( body );
      var len = Object.keys(json.businesses).length;
      var arrayOfVenues = [];
      for (var i = 0; i < len; i++) {
        arrayOfVenues.push(json.businesses[i].id);
      }
      var bars = db.collection( 'bars' );
      bars.find(
        {
          yelpId: { $in: arrayOfVenues }
      }).toArray( function( err, docs ) {
        if (err) console.log(err);
        // console.log(docs);
        var arrayOfBuzzingVenues = [];
        for (var i = 0; i < docs.length; i++) {
          arrayOfBuzzingVenues.push(docs[i].yelpId);
        }
        res.render( 'pages/whats-on', { json: json, user: req.user, docs: docs, arrayOfBuzzingVenues: arrayOfBuzzingVenues, loc: loc } );  
      });
    }
  });
  
});

router.post( '/process', 
  passwordless.restricted( 
    { 
      originField: 'origin',
      failureRedirect: '/login' 
    } ),  
  function( req, res ) {
    var db = req.db;
    var username = req.body.userEmail;
    var location = req.body.location;
    var yelpId = req.body.yelpId;
    var bars = db.collection( 'bars' );
    bars.find( { yelpId: yelpId } ).toArray( function ( err, docs ) {
      if ( err ) console.log( err );
      if ( docs.length > 0 ) {
        if ( docs[0].punters.indexOf( username ) > -1) {
          bars.update( { yelpId: yelpId }, { $pull: { punters: username }});
        } else {
          bars.update( { yelpId: yelpId }, { $push: { punters: username }});
        }
      } else {
        bars.insert({ yelpId: yelpId, punters: [ username ]});
      }
    })
    res.redirect( 'back' ); // get rid of this once AJAX is implemented? res.end()?
})

router.get ( '/whats-on', function( req, res ) {
  res.render( 'pages/whats-on', { user : req.user } );
});

// GET /login
router.get( '/login', function( req, res ) {
  res.render( 'pages/login', { user: req.user });
});

/* POST login screen. */
router.post( '/sendtoken', 
	passwordless.requestToken(
		// Simply accept every user
		function( user, delivery, callback ) {
			callback( null, user );
		}, { originField: 'origin' }),
	function( req, res ) {
  		res.render('pages/sent', { user: req.user });
});

// GET logout
router.get( '/logout', passwordless.logout(), function( req, res ) {
  res.redirect( '/' );
})

module.exports = router;