var HeadQueue = require('./head-queue');

//lazy output.
var logJSON = function(objectData) {
  console.log(JSON.stringify(objectData));
};

var redirectMapOptions = {
  callback: logJSON,
  maxRedirectReqs: 10,
  rejectUnauthorized: true
};

var redirectMap = HeadQueue(['https://raronas/1','http://raromachine.com'], redirectMapOptions);