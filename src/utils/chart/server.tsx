const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer({
        // Increase the maximum payload size
        maxHeaderSize: 32768,
        // Increase timeouts
        timeout: 300000, // 5 minutes
        keepAliveTimeout: 30000
    }, async (req, res) => {
        try {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Increase request timeout
            req.setTimeout(300000);
            
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    });

    // Configure server timeouts
    server.keepAliveTimeout = 30000;
    server.headersTimeout = 35000;

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 