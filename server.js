const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME type mapping to serve HTML, CSS, and other static files correctly.
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Helper function to send a complete HTML page with status code.
function sendHtml(response, statusCode, htmlContent) {
  response.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  response.write(htmlContent);
  response.end();
}

// Helper function to serve a file from the public folder.
function serveFile(response, filePath, statusCode = 200) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') {
        sendHtml(response, 404, `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Page Not Found</title>
              <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
              <div class="error-container">
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <a href="/" class="nav-button">Go to Home</a>
              </div>
            </body>
          </html>
        `);
      } else {
        sendHtml(response, 500, `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Server Error</title>
              <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
              <div class="error-container">
                <h1>500 - Server Error</h1>
                <p>Something went wrong while processing your request.</p>
                <a href="/" class="nav-button">Go to Home</a>
              </div>
            </body>
          </html>
        `);
      }
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    response.writeHead(statusCode, { 'Content-Type': contentType });
    response.end(data);
  });
}

// Create the main HTTP server.
const server = http.createServer((request, response) => {
  // Parse the incoming URL to identify the requested route.
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  console.log(`Request received: ${request.method} ${pathname}`);

  // Route: Home page
  if (pathname === '/') {
    const homePage = path.join(PUBLIC_DIR, 'index.html');
    serveFile(response, homePage, 200);
    return;
  }

  // Route: About page
  if (pathname === '/about') {
    const aboutPage = path.join(PUBLIC_DIR, 'about.html');
    serveFile(response, aboutPage, 200);
    return;
  }

  // Static CSS file serving
  if (pathname === '/style.css') {
    const cssFile = path.join(PUBLIC_DIR, 'style.css');
    serveFile(response, cssFile, 200);
    return;
  }

  // Invalid route handling
  const pageNotFoundHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Page Not Found</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div class="error-container">
          <h1>404 - Page Not Found</h1>
          <p>The requested page could not be found.</p>
          <a href="/" class="nav-button">Back to Home</a>
        </div>
      </body>
    </html>
  `;

  sendHtml(response, 404, pageNotFoundHtml);
});

// Starts the server and listens for requests on port 3000.
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown messages for a cleaner laboratory demonstration.
process.on('SIGINT', () => {
  console.log('\nServer stopped.');
  process.exit(0);
});
