var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
  if(req.url === '/tests/blanket.min.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./tests/blanket.min.js'));
    return;
  }
  if(req.url === '/tests/tests.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./tests/tests.js'));
    return;
  }
  if(req.url === '/data_collection.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./data_collection.js'));
    return;
  }
  if(req.url === '/data_collection-min.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./data_collection-min.js'));
    return;
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync('./test.html'));
}).listen(8888);

console.log('testserv listening on port 8888');
