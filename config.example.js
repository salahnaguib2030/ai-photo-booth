// Configuration for AI Photo Booth - TEMPLATE FILE
// Copy this file to config.js and add your actual webhook URL

const CONFIG = {
    // Replace with your n8n webhook URL
    N8N_WEBHOOK_URL: 'YOUR_N8N_WEBHOOK_URL_HERE',
    
    // Timeout for image processing (in milliseconds)
    TIMEOUT: 180000 // 180 seconds - adjust based on your n8n workflow
};

// =============================================================
// SETUP INSTRUCTIONS
// =============================================================
//
// 1. Copy this file to config.js:
//    cp config.example.js config.js
//
// 2. Replace YOUR_N8N_WEBHOOK_URL_HERE with your n8n webhook URL
//
// 3. Your n8n workflow will receive:
//    - image: Binary file (photo.jpg)
//    - style: Text field ("realistic" or "disney")
//
// 4. Your n8n workflow should return one of:
//    a) Binary image (PNG/JPEG) - just return the image file
//    b) JSON with URL: { "editedImageUrl": "https://..." }
//    c) JSON with base64: { "editedImageBase64": "..." }
//
// =============================================================
// N8N WORKFLOW SETUP
// =============================================================
//
// Required nodes in your n8n workflow:
//
// 1. WEBHOOK TRIGGER (first node)
//    - HTTP Method: POST
//    - Path: your-path (e.g., "photo-booth")
//    - IMPORTANT: In Settings, set "Respond" to "Using 'Respond to Webhook' Node"
//
// 2. YOUR PROCESSING NODES
//    - Add your AI image processing nodes here
//    - The image is available as binary data
//    - The style is in the request body
//
// 3. RESPOND TO WEBHOOK (last node)
//    - Set "Respond With" to "Binary" if returning an image file
//    - Or set to "JSON" if returning a URL/base64
//
