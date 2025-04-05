// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const { createProxyServer } = require('http-proxy');

require('dotenv').config()

const app = express();

const BACKEND_SERVER = `http://${process.env.BACKEND_IP}:${process.env.BACKEND_PORT}`;

//Proxy for POST requests
app.use((req, res, next) => {
    console.log('Incoming request path:', req.path);
    next();
  });

// Try to match all the path and direct to pass the whole path to backend
// Becareful not to specify type the desire path '/request-token' since express would auto strip the path and turn into '/'
// before sending to backend
app.use('/', createProxyMiddleware({
  target: BACKEND_SERVER,
  changeOrigin: true,
  pathRewrite: {}, //(path, req) => path,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying to:', req.originalUrl);
  }
}));

// WebSocket proxy
const proxy = createProxyServer({
  target: BACKEND_SERVER,
  ws: true,
  changeOrigin: true,
});

// Upgrade requests for WebSocket
const server = http.createServer(app);
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start server
const PORT = process.env.PROXY_SERVER_PORT;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
