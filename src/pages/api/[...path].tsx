import getConfig from 'next/config';
import { CustomProxy } from '../../lib/proxy';

const { serverRuntimeConfig } = getConfig();

// Create proxy instance
const proxy = new CustomProxy({
    target: serverRuntimeConfig.apiUrl,
    changeOrigin: true,
    secure: false,
    timeout: 300000,
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

        // Forward the request to the API
        await proxy.web(req, res, {
            target: serverRuntimeConfig.apiUrl,
        });
    } catch (err) {
        console.error('Handler error:', err);
        if (!res.headersSent) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
                error: 'Handler error',
                details: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }));
        }
    }
} 