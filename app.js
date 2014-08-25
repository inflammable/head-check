var headcheck = require('./head-check');

//lazy output.
var logJSON = function(objectData) {
      console.log(JSON.stringify(objectData));
    };

var redirectMapOptions = {
      //startOnInit: true,
      callback: logJSON
    },
    redirectMap = headcheck('cake://raronas/1', redirectMapOptions);
    redirectMap.start();