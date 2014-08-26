//
// Example of how HeadCheck is used.
//

var HeadCheck = require('./index');

//lazy output.
var logJSON = function(objectData) {
  console.log(JSON.stringify(objectData));
};

var redirectMapOptions = {
  callback: logJSON,
  maxRedirectReqs: 10,
  rejectUnauthorized: true
};

var redirectMap = HeadCheck(['http://example.com','http://test.com'], redirectMapOptions);
