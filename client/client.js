const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'assets', 'index.html');
  let contentType = 'text/html';
  
  if (req.url === '/app.js') {
      filePath = path.join(__dirname, 'assets', 'app.js');
      contentType = 'application/javascript';
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Error');
    } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    }
  });
})

server.listen(port, () => {
  console.log(`Client is running at http://localhost:${port}`);
});