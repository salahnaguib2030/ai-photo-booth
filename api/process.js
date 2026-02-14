// Serverless function to proxy requests to n8n webhook
// This avoids CORS issues by handling the request server-side

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const N8N_WEBHOOK_URL = 'https://naguibdev.app.n8n.cloud/webhook/photo-booth';
        
        console.log('📸 Proxying request to n8n webhook...');
        
        // Get the image and style from the request body
        const { image, style } = req.body;
        
        if (!image || !style) {
            return res.status(400).json({ 
                error: 'Missing required fields: image and style' 
            });
        }

        // Convert base64 image to blob/buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Create FormData for n8n
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', imageBuffer, {
            filename: 'photo.jpg',
            contentType: 'image/jpeg'
        });
        formData.append('style', style);
        
        // Forward request to n8n webhook
        const fetch = require('node-fetch');
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        console.log('n8n response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('n8n error:', errorText);
            return res.status(response.status).json({ 
                error: `n8n webhook error: ${response.status}`,
                details: errorText
            });
        }
        
        // Check content type
        const contentType = response.headers.get('content-type') || '';
        
        // If response is an image, convert to base64 and send
        if (contentType.includes('image/')) {
            const imageBuffer = await response.buffer();
            const base64Image = imageBuffer.toString('base64');
            
            return res.status(200).json({
                success: true,
                imageBase64: base64Image,
                contentType: contentType
            });
        }
        
        // If response is JSON, parse and send
        const data = await response.json();
        return res.status(200).json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('❌ Error in proxy:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
