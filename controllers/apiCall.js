/* require the modules needed */
require('dotenv').config();
var oauthSignature = require('oauth-signature');  
var n = require('nonce')();  
var request = require('request');  
var qs = require('querystring');  
var _ = require('lodash');

/* Function for yelp call
 * ------------------------
 * set_parameters: object with params to search
 * callback: callback(error, response, body)
 */
var request_yelp = function(set_parameters, callback) {

  /* The type of request */
  var httpMethod = 'GET';

  /* The url we are using for the request */
  var url = 'http://api.yelp.com/v2/search';

  /* We can setup default parameters here */
  var default_parameters = {
    location: 'Melbourne',
    sort: '2'
  };

  /* We set the require parameters here */
  var required_parameters = {
    oauth_consumer_key : process.env.ConsumerKey,
    oauth_token : process.env.Token,
    oauth_nonce : n(),
    oauth_timestamp : n().toString().substr(0,10),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0'
  };

  /* We combine all the parameters in order of importance */ 
  var parameters = _.assign(default_parameters, set_parameters, required_parameters);

  /* We set our secrets here */
  var consumerSecret = process.env.ConsumerSecret;
  var tokenSecret = process.env.TokenSecret;
  
  /* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
  /* Note: This signature is only good for 300 seconds after the oauth_timestamp */
  var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});

  /* We add the signature to the list of paramters */
  parameters.oauth_signature = signature;

  /* Then we turn the paramters object, to a query string */
  var paramURL = qs.stringify(parameters);

  /* Add the query string to the url */
  var apiURL = url+'?'+paramURL;

  /* Then we use request to send make the API Request */
  request(apiURL, function(error, response, body){
    return callback(error, response, body);
  });

};

// request_yelp(null, function( err, response, body ) {
//   if ( err ) {
//     console.log(err);
//   } else {
//     var json = JSON.parse(body);
//     console.log( json.businesses[1].name );
//   }
// })

module.exports = request_yelp;