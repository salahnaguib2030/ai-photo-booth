# AI Photo Booth 📸

A modern photo booth web app that captures photos and transforms them using **n8n workflows** for AI image processing.

## Features

- 📷 **Camera Access** - Direct browser camera integration
- 🎨 **Style Selection** - Choose between "Realistic" and "Disney" styles
- ☁️ **n8n Integration** - Process images using your custom n8n workflow
- 📱 **Responsive** - Works on desktop and mobile devices
- ⬇️ **Download** - Save processed images to your device

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-photo-booth.git
cd ai-photo-booth
```

### 2. Configure

```bash
# Copy the example config
cp config.example.js config.js

# Edit config.js and add your n8n webhook URL
```

### 3. Run Locally

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## n8n Workflow Setup

Your n8n workflow receives:
- **image** - Binary file (JPEG image)
- **style** - Text field ("realistic" or "disney")

### Required n8n Configuration

1. **Webhook Trigger Node**
   - HTTP Method: `POST`
   - In Settings → Respond: `Using 'Respond to Webhook' Node`

2. **Your Processing Nodes**
   - Add AI image processing (e.g., OpenAI, Replicate, etc.)
   - Access image: `$binary.image`
   - Access style: `$json.style`

3. **Respond to Webhook Node**
   - Respond With: `Binary` (to return image file directly)
   - Or: `JSON` with `{ "editedImageUrl": "https://..." }`

## Deploy to Vercel

### Option 1: Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Option 2: Manual Deploy

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/ai-photo-booth.git
git push -u origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Deploy

**Important:** After deployment, update `config.js` with your n8n webhook URL.

## Project Structure

```
├── index.html          # Main HTML page
├── app.js              # Application logic
├── styles.css          # Styling
├── config.js           # Your configuration (gitignored)
├── config.example.js   # Configuration template
├── vercel.json         # Vercel deployment config
└── package.json        # Project metadata
```

## Configuration

Edit `config.js`:

```javascript
const CONFIG = {
    N8N_WEBHOOK_URL: 'https://your-n8n.app.n8n.cloud/webhook/photo-booth',
    TIMEOUT: 180000
};
```

## Response Formats

The app accepts these response formats from n8n:

### Binary Image (Recommended)
Return the image directly with `Content-Type: image/png` or `image/jpeg`

### JSON with URL
```json
{
  "editedImageUrl": "https://your-storage.com/image.jpg"
}
```

### JSON with Base64
```json
{
  "editedImageBase64": "iVBORw0KGgo..."
}
```

## Troubleshooting

### Empty Response from n8n
- Ensure Webhook node has "Respond" set to "Using 'Respond to Webhook' Node"
- Add a "Respond to Webhook" node at the end of your workflow

### CORS Errors
- Your n8n instance must allow CORS from your domain
- In n8n cloud, this is handled automatically

### Camera Not Working
- Allow camera permissions in browser
- Use HTTPS (required for camera access on deployed sites)

## License

MIT
# ai-photo-booth
