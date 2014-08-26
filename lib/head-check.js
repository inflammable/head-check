var HeadRequest = require('./head-request');

/**
 * Class to dispatch one or more head-response queries.
 * @param {string|string[]} urlList - list of URLs to query
 * @param {Object} [options]
 * @param {Number} [options.maxRedirectReqs] - max number of hops
 * @param {String} [options.rejectUnauthorized] - reject invalid https certs
 * @param {Function} [options.callback=function(){}] - callback when complete
 */

module.exports = function(urlList, options) {

  urlList = typeof urlList === 'string' ? [].push(urlList) : urlList;

  options = options || {};

  callback = options.callback || function() {};

  options.callback = saveResult;

  if (urlList.length === 0) {
    return options.callback();
  }

  var results = [];

  function saveResult(result) {
    results.push(result);
    if(results.length == urlList.length) {
      callback(results);
    }
  }

  function processUrlList() {
    for(var i = 0; i < urlList.length; i++) {
      (function(i) {
        var currentUrl = urlList[i];
        process.nextTick( function() { HeadRequest(currentUrl, options); });
      })(i);
    }
  }

  processUrlList();

};
