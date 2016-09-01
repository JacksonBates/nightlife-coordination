var express = require( 'express' );
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mongodb = require( 'mongodb' );
var yelp = require( './controllers/apiCall.js');
// var userQueries = require( './controllers/userQueries' );

// Homepage for the app, 
router.get( '/', function( req, res ) {
  res.render( 'pages/index' );
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
  console.log( req.body.location-input );
  res.end();
});

module.exports = router;