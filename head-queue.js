// urlList: <array> or <string> - http or https
// options: <object> - {
//   maxRedirectReqs: <int>, - number of times to follow a redirect before aborting
//   rejectUnauthorized: <bool>, - follow non-valid SSL certificates
//   callback: <func>,
// }

var HeadCheck = require('./head-check');

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
        process.nextTick( function() { HeadCheck(currentUrl, options); });
      })(i);
    }
  }

  processUrlList();

};