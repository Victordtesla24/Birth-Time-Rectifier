import http from 'http';
import https from 'https';
import { URL } from 'url';

export class CustomProxy {
    constructor(options = {}) {
        this.target = options.target;
        this.changeOrigin = options.changeOrigin || false;
        this.secure = options.secure !== false;
        this.timeout = options.timeout || 900000; // Increased to 15 minutes for long-running calculations
    }

    web(req, res, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const targetUrl = new URL(options.target || this.target);
                const protocol = targetUrl.protocol === 'https:' ? https : http;
                
                // Prepare headers
                const headers = Object.assign({}, req.headers);
                if (this.changeOrigin) {
                    headers.host = targetUrl.host;
                }
                
                // Ensure content-length is set correctly for the body
                if (req.body) {
                    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                    headers['content-length'] = Buffer.byteLength(body);
                    // Ensure content-type is set for JSON
                    if (!headers['content-type']) {
                        headers['content-type'] = 'application/json';
                    }
                }
                
                delete headers.connection;
                
                // Extract the actual endpoint path from the request URL
                const path = req.url;
                
                // Prepare request options with increased timeouts
                const requestOptions = {
                    protocol: targetUrl.protocol,
                    hostname: targetUrl.hostname,
                    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
                    path: path,
                    method: req.method,
                    headers: headers,
                    timeout: this.timeout,
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 1
                };

                console.log('Proxy request options:', {
                    url: `${requestOptions.protocol}//${requestOptions.hostname}:${requestOptions.port}${requestOptions.path}`,
                    method: requestOptions.method,
                    headers: requestOptions.headers,
                    body: req.body
                });

                // Create proxy request with proper error handling
                const proxyReq = protocol.request(requestOptions, (proxyRes) => {
                    // Copy status code
                    res.statusCode = proxyRes.statusCode;
                    
                    // Copy headers
                    const responseHeaders = Object.assign({}, proxyRes.headers);
                    Object.keys(responseHeaders).forEach(key => {
                        res.setHeader(key, responseHeaders[key]);
                    });

                    // Collect response data with timeout handling
                    let responseData = '';
                    let responseTimeout = setTimeout(() => {
                        proxyRes.destroy(new Error('Response timeout'));
                    }, this.timeout);

                    proxyRes.on('data', chunk => {
                        responseData += chunk;
                        // Reset timeout on data received
                        clearTimeout(responseTimeout);
                        responseTimeout = setTimeout(() => {
                            proxyRes.destroy(new Error('Response timeout'));
                        }, this.timeout);
                    });

                    proxyRes.on('end', () => {
                        clearTimeout(responseTimeout);
                        try {
                            // Try to parse JSON response
                            const jsonResponse = JSON.parse(responseData);
                            // Ensure complete response is written before ending
                            const responseStr = JSON.stringify(jsonResponse);
                            res.setHeader('Content-Length', Buffer.byteLength(responseStr));
                            res.write(responseStr);
                            res.end();
                        } catch (e) {
                            // If not JSON, send as is
                            res.setHeader('Content-Length', Buffer.byteLength(responseData));
                            res.write(responseData);
                            res.end();
                        }
                        resolve();
                    });

                    // Handle response errors
                    proxyRes.on('error', (err) => {
                        clearTimeout(responseTimeout);
                        console.error('Proxy response error:', err);
                        if (!res.headersSent) {
                            res.writeHead(500, {
                                'Content-Type': 'application/json',
                            });
                            res.end(JSON.stringify({ 
                                error: 'Proxy response error', 
                                details: err.message,
                                path: path,
                                method: req.method
                            }));
                        }
                        reject(err);
                    });
                });

                // Handle request errors
                proxyReq.on('error', (err) => {
                    console.error('Proxy request error:', err);
                    if (!res.headersSent) {
                        res.writeHead(500, {
                            'Content-Type': 'application/json',
                        });
                        res.end(JSON.stringify({ error: 'Proxy request error', details: err.message }));
                    }
                    reject(err);
                });

                // Set request timeout with proper cleanup
                const timeoutId = setTimeout(() => {
                    proxyReq.destroy(new Error('Proxy request timeout'));
                }, this.timeout);

                proxyReq.on('socket', (socket) => {
                    socket.on('end', () => clearTimeout(timeoutId));
                    socket.on('error', () => clearTimeout(timeoutId));
                    socket.on('timeout', () => {
                        proxyReq.destroy(new Error('Socket timeout'));
                    });
                });

                // Write request body if exists
                if (req.body) {
                    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                    proxyReq.write(body);
                }
                
                // End request
                proxyReq.end();
            } catch (err) {
                console.error('Proxy setup error:', err);
                if (!res.headersSent) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                    });
                    res.end(JSON.stringify({ error: 'Proxy setup error', details: err.message }));
                }
                reject(err);
            }
        });
    }
} 