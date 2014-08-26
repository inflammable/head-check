var http = require('http');
var https = require('https');
var url = require('url');

/**
 * Class to dispatch a single URL query
 * @param {String} url
 * @param {Object} [options]
 * @param {!number} [options.maxRedirectReqs=10]
 * @param {boolean} [options.rejectUnauthorized=false]
 * @callback {Function} [options.callback=function(){}]
 */

module.exports = function(startingUrl, options) {

  var results = [],
      currentDepth = 0;

  options = options || {};
  options.maxRedirectReqs = options.maxRedirectReqs || 10;
  options.rejectUnauthorized = options.rejectUnauthorized || false;
  options.callback = options.callback || function() {};

  function packageRequest(requestUrl) {
    var parsedUrl = url.parse(requestUrl, true);
    var requestObject = {
      method: 'HEAD'
    };

    requestObject.host = parsedUrl.host;
    requestObject.port = parsedUrl.port || parsedUrl.protocol === 'https:' ? 443 : 80;
    requestObject.pathname = parsedUrl.pathname || '/';
    requestObject.path = parsedUrl.path || '/';
    requestObject.search = parsedUrl.search;
    requestObject.protocol = parsedUrl.protocol;
    requestObject.rejectUnauthorized = parsedUrl.protocol === 'https:' ? options.rejectUnauthorized : null;

    return requestObject;
  }

  function  makeRequest(requestUrl) {
    var requestObject = packageRequest(requestUrl);
    var request;

    switch (requestObject.protocol) {
      case 'http:':
        try {
          request = http.request(requestObject, processHeaders);
          //request.on('error', updateResultsWithError);
          request.end();
        } catch (e) {
          updateResultsWithError(e);
        }
        break;
      case 'https:':
        try {
          request = https.request(requestObject, processHeaders);
          request.on('error', updateResultsWithError);
          request.end();
        } catch (e) {
          updateResultsWithError(e);
        }
        break;
      default:
        var errorMessage = "Unknown protocol: '" + requestObject.protocol + "'";
        throw errorMessage;
    }
  }

  function processHeaders(response) {
    updateResultStatus(response.statusCode);
    if((response.statusCode == 301 || response.statusCode == 302) &&
       response.headers.location.length > 0) {
      updateResults(response.headers.location);
      redirect(response.headers.location);
    } else {
      return options.callback(results);
    }
  }


  function redirect(redirectUrl) {
    if (currentDepth < options.maxRedirectReqs) {
      currentDepth++;
      var redirectRequestObject = url.parse(redirectUrl);
      makeRequest(redirectRequestObject);
    }
  }

  function updateResults(resultUrl) {
    results.push({url:resultUrl, statusCode: null, error: null});
  }

  function updateResultsWithError(error) {
    results[results.length-1].error = error;
    return options.callback(results);
  }

  function updateResultStatus(resultStatus) {
    results[results.length-1].statusCode = resultStatus;
  }

  function start() {
    if(results.length === 0) {
      updateResults(startingUrl);
      makeRequest(startingUrl);
    }
  }

  start();
};

