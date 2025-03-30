const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '.env.local' }); // Load environment variables from .env.local

// Get Cloud Run URL from environment or use a fallback for development
const CLOUD_RUN_URL = process.env.REACT_APP_CLOUD_RUN_URL || 'http://localhost:8080';

module.exports = function(app) {
  console.log(`[Proxy] Setting up proxy to: ${CLOUD_RUN_URL}`);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: CLOUD_RUN_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove the /api prefix when forwarding requests
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log proxy response for debugging
        console.log('PROXY RESPONSE:', {
          status: proxyRes.statusCode,
        });
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
      }
    })
  );
};