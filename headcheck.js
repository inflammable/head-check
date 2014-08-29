#!/usr/bin/env node
var args = process.argv.slice(2);

process.on('SIGINT', function () {
  console.log('headcheck cancelled...');
  process.exit(0);
});

var HeadCheck = require('./lib/head-request');
var options = {callback: returnCheckResult};

function findUrls(singleArg) {
  return /^https?:\/\//.test(singleArg);
}

function findOpts(singleArg) {
  return /^-(r|m=[0-9]*)/.test(singleArg);
}

function processOptions(optionArg) {
  if(optionArg.indexOf('-r') === 0 ) {
    options.rejectUnauthorized=true;
  }
  if(optionArg.indexOf('-m') === 0 ) {
    var maxHops = optionArg.split('=');
    if(maxHops[1] && maxHops[1] > 0) {
      options.maxRedirectReqs = maxHops[1];
    }
  }
}

function startCheck(url) {
  if(/^https?:\/\//.test(url)) {
    process.stdout.write('Checking URL: ' + url + '\n');
    HeadCheck(url, options);
  }
}

function returnCheckResult(urlResult) {
  process.stdout.write(JSON.stringify(urlResult));
}

if (args.length) {
  var urls = args.filter(findUrls);
  var opts = args.filter(findOpts);
  urls.forEach(startCheck);
} else {
  process.stdout.write('Usage:\nheadcheck -r -m<number of hops> <http[s]://example.url/path> <[http[s]://example2.url/path]>');
}
