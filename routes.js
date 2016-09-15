var express = require( 'express' );
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mongodb = require( 'mongodb' );
var yelp = require( './controllers/apiCall.js');
var passwordless = require('passwordless');


// var userQueries = require( './controllers/userQueries' );

// Homepage for the app, 
router.get( '/', function( req, res ) {
  res.render( 'pages/index', { user: req.user } );
});

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
			// usually you would want something like:
			// User.find({email: user}, callback(ret) {
			// 		if(ret)
			// 			callback(null, ret.id)
			// 		else
			// 			callback(null, null)
			// })
		}),
	function( req, res ) {
  		res.render('pages/sent', { user: req.user });
});

// test restricted pages
/* GET restricted site. */
router.get( '/restricted', passwordless.restricted( { failureRedirect: '/login' } ),
  function( req, res ) {
    res.render( 'pages/restricted' , { user: req.user });
});

module.exports = router;