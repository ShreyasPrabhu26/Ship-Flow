/**
 * S3 Reverse Proxy Server
 * 
 * This server proxies requests to the appropriate subdirectory in an S3 bucket
 * based on the subdomain of the incoming request.
 */

// Import required dependencies
const express = require("express");
const httpProxy = require("http-proxy");

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 8000;

// Setup middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base URL for the S3 bucket containing build artifacts
const BASE_PATH = "https://ship-flow-builds.s3.ap-south-1.amazonaws.com/builds";

// Create an HTTP proxy server
const proxy = httpProxy.createProxyServer({});

/**
 * Main middleware to handle all incoming requests
 * Routes requests to the appropriate S3 path based on subdomain
 */
app.use((req, res) => {
    // Extract hostname and subdomain from the request
    const hostName = req.hostname;
    const subDomain = hostName.split('.')[0];
    const path = req.path;
    const resolvesTo = `${BASE_PATH}/${subDomain}`;

    console.log(`Proxying request: ${req.url} to ${resolvesTo}${path}`);

    // Forward the request to the appropriate S3 path
    return proxy.web(req, res, {
        target: resolvesTo,
        changeOrigin: true,
    });
});

/**
 * Handle proxy request modification
 * Appends 'index.html' to the path if the request is for the root URL
 */
proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html';
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});