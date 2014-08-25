/*

url: <string> - http or https
options: <object> - {
  maxRedirectReqs: <int>, - number of times to follow a redirect before aborting
  rejectUnauthorized: <bool>, - follow non-valid SSL certificats
  callback: <func>,
  startOnInit: <bool> - true to start when object is created.
}

*/

var headcheck = function(startingUrl, options) {

  var http = require('http'),
    https = require('https'),
    url = require('url');

  var results = [],
      currentDepth = 0;

  var options = options || {};

  if(!options.hasOwnProperty('maxRedirectReqs')) {
     options.maxRedirectReqs = 10;
  } else {
     options.maxRedirectReqs = parseInt(options.maxRedirectReqs,10);
  }

  if(!options.hasOwnProperty('rejectUnauthorized')) {
    options.rejectUnauthorized = false;
  }

  if(!options.hasOwnProperty('callback') || typeof options.callback !== 'function') {
    options.rejectUnauthorized = function(resultsData){};
  }

  var packageRequest = function(requestUrl) {
      var parsedUrl = url.parse(requestUrl, true),
          requestObject = {
            method: 'HEAD',
            protocol: 'http:',
            host: '',
            port: '80',
            pathname: '/',
            path: '/'
          };

      requestObject.host = parsedUrl.host;
      requestObject.port = parsedUrl.port || parsedUrl.protocol == 'https:' ? 443 : 80;
      requestObject.pathname = parsedUrl.pathname;
      requestObject.path = parsedUrl.path;
      requestObject.search = parsedUrl.search;
      requestObject.protocol = parsedUrl.protocol;
      requestObject.rejectUnauthorized = parsedUrl.protocol == 'https:' ? rejectUnauthorized : null;

      return requestObject;
    },
    makeRequest = function(requestUrl) {
      var requestObject = packageRequest(requestUrl),
          request;

      switch (requestObject.protocol) {
        case 'http:':
          request = http.request(requestObject, processHeaders);
          request.end();
          break;
        case 'https:':
          request = https.request(requestObject, processHeaders);
          request.end();
          break;
        default:
          console.log("Unknown protocol: '" + requestObject.protocol + "'");
      }
    },
    processHeaders = function(response) {
      updateResultStatus(response.statusCode);
      if((response.statusCode == 301 || response.statusCode == 302) &&
          response.headers.location.length > 0) {
        updateResults(response.headers.location);
        redirect(response.headers.location);
      } else {
        options.callback(results);
      }
    },
    redirect = function(redirectUrl) {
      if (currentDepth < options.maxRedirectReqs) {
        currentDepth++;
        var redirectRequestObject = url.parse(redirectUrl);
        makeRequest(redirectRequestObject);
      }
    },
    updateResults = function(resultUrl) {
      results.push({url:resultUrl, statusCode: null});
    },
    updateResultStatus = function(resultStatus) {
      results[results.length-1].statusCode = resultStatus;
    },
    start = function() {
      if(results.length === 0) {
        updateResults(startingUrl);
        makeRequest(startingUrl);
      }
    };

  if(options.hasOwnProperty('startOnInit') && options.startOnInit === true) {
    start();
  } else {
    return {
      start: start
    };
  };
};

//lazy output.
var logJSON = function(objectData) {
      console.log(JSON.stringify(objectData));
    };

var redirectMapOptions = {
      callback: logJSON,
      startOnInit: true
    },
    redirectMap = new headcheck('http://raronas/1', redirectMapOptions);
