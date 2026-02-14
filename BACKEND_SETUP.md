# Backend Proxy Setup (No CORS Issues!)

## Overview

The photo booth now uses a backend API proxy to communicate with n8n, eliminating CORS issues entirely.

## How It Works

```
Browser → Backend API (/api/process) → n8n Webhook → AI Processing → Backend → Browser
```

**Benefits:**
- ✅ No CORS errors
- ✅ Server-to-server communication
- ✅ Secure (n8n webhook URL not exposed to client)
- ✅ Works on any domain

## File Structure

```
/api/
  └── process.js          # Serverless function (Vercel)
camera.js                 # Updated to use /api/process
config.js                 # Points to local API endpoint
package.json              # Added node-fetch and form-data
vercel.json               # Configured API routes
```

## Deployment

### Vercel (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

The `/api/process` endpoint will automatically be available as a serverless function.

### Local Development

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Run locally:**
   ```bash
   vercel dev
   ```

This will start a local server with serverless functions enabled.

### Alternative: Node.js Server

If you prefer a traditional server instead of serverless:

Create `server.js`:
```javascript
const express = require('express');
const FormData = require('form-data');
const fetch = require('node-fetch');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

app.post('/api/process', async (req, res) => {
    // Same logic as api/process.js
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## API Endpoint

**POST** `/api/process`

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "style": "realistic" | "disney"
}
```

**Response:**
```json
{
  "success": true,
  "imageBase64": "...",
  "contentType": "image/png"
}
```

## Testing

1. Navigate to the photo booth
2. Take a photo
3. Select style (realistic/disney)
4. Approve

The image will be sent to `/api/process`, which forwards it to n8n, and returns the result. No CORS errors!

## Troubleshooting

**Error: "Failed to fetch"**
- Check if Vercel deployment is working
- Verify serverless function is deployed: `https://your-site.vercel.app/api/process`

**Error: "Backend API error"**
- Check n8n webhook is responding
- Verify n8n workflow is active
- Check n8n logs for errors

**Image not processing**
- Check n8n webhook URL in `api/process.js` is correct
- Verify n8n workflow accepts FormData with `image` and `style` fields
