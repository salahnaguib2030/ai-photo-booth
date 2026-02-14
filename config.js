// Configuration for n8n webhook photobooth
const CONFIG = {
    // Backend API endpoint (proxies to n8n webhook to avoid CORS)
    API_ENDPOINT: '/api/process',
    
    // Fallback n8n webhook URL (for direct access if needed)
    N8N_WEBHOOK_URL: 'https://naguibdev.app.n8n.cloud/webhook/photo-booth',
    
    // Timeout for processing
    TIMEOUT: 180000 // 180 seconds
};