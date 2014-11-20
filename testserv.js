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
  if(req.url === '/data_collection-1.1.6.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./data_collection-1.1.6.js'));
    return;
  }
  if(req.url === '/data_collection-1.1.6-min.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync('./data_collection-1.1.6-min.js'));
    return;
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync('./test.html'));
}).listen(8888);

console.log('testserv listening on port 8888');
