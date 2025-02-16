import getConfig from 'next/config';
import { CustomProxy } from '../../../lib/proxy';

const { serverRuntimeConfig } = getConfig();

// Create proxy instance outside of the handler to reuse
const proxy = new CustomProxy({
    target: 'http://localhost:3333',  // Update to use the base URL
    changeOrigin: true,
    secure: false,
    timeout: 30000,
});

export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
};

export default async function handler(req, res) {
    try {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            });
            res.end();
            return;
        }

        // Log request details for debugging
        console.log('Incoming request:', {
            method: req.method,
            url: req.url,
            body: req.body,
            headers: req.headers
        });

        // Verify API URL is configured
        if (!serverRuntimeConfig.apiUrl) {
            throw new Error('API URL is not configured');
        }

        // Forward the request to the API
        const proxyOptions = {
            target: 'http://localhost:3333',  // Use the base URL
        };

        await proxy.web(req, res, proxyOptions);
    } catch (err) {
        console.error('Handler error:', err);
        
        // Determine appropriate status code
        const statusCode = err.code === 'ECONNREFUSED' ? 503 : 500;
        
        if (!res.headersSent) {
            res.writeHead(statusCode, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
                error: 'Handler error',
                message: err.message,
                code: err.code,
                // Only include stack trace in development
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }));
        }
    }
} 