# Fix n8n 404 Error

## Problem
The backend API is working, but n8n is returning **404 Not Found**. This means:
- ❌ The n8n workflow doesn't exist at that URL
- ❌ The n8n workflow is not active/published
- ❌ The webhook URL is incorrect

## Solution Steps

### 1. Check Your n8n Workflow

**Login to n8n:**
- Go to: https://naguibdev.app.n8n.cloud
- Make sure you're logged in

### 2. Verify Webhook URL

**Current webhook URL:** `https://naguibdev.app.n8n.cloud/webhook/photo-booth`

Check if this matches your n8n workflow:
1. Open your photo booth workflow in n8n
2. Find the "Webhook" trigger node
3. Check the webhook path - should be: `/photo-booth`
4. The full URL should match: `https://naguibdev.app.n8n.cloud/webhook/photo-booth`

### 3. Activate the Workflow

**Make sure the workflow is ACTIVE:**
1. Open the workflow in n8n
2. Click the toggle switch in the top-right corner
3. It should show "Active" with a green checkmark

### 4. Test the Webhook

Test if the webhook responds:

```bash
curl -X POST https://naguibdev.app.n8n.cloud/webhook/photo-booth \
  -F "image=@test.jpg" \
  -F "style=realistic"
```

**Expected response:**
- ✅ 200 OK with processed image
- ❌ 404 = workflow not active or wrong URL
- ❌ 500 = workflow has an error

### 5. Create the n8n Workflow (If It Doesn't Exist)

**Minimum workflow structure:**

```
1. Webhook Trigger
   - HTTP Method: POST
   - Path: photo-booth
   - Response Mode: "When Last Node Finishes"

2. Extract Binary Data
   - Get image file from request

3. Your AI Processing Nodes
   - (Your custom AI/image processing logic)

4. Return Processed Image
   - Respond to Webhook node
   - Return the processed image
```

### 6. Update Webhook URL (If Different)

If your webhook URL is different, update it in:

**File:** `api/process.js`

```javascript
const N8N_WEBHOOK_URL = 'https://YOUR-ACTUAL-N8N-URL/webhook/YOUR-PATH';
```

### 7. Redeploy to Vercel

After fixing n8n, redeploy:

```bash
cd /home/naguibdev/phtobooth
git add .
git commit -m "Fix n8n webhook configuration"
git push origin main
```

Vercel will auto-deploy.

### 8. Alternative: Use Test Endpoint (Temporary)

For testing without n8n, you can create a mock endpoint that returns the original image:

**File:** `api/process.js` (temporary test version)

```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, style } = req.body;
        
        // For testing: just return the original image
        return res.status(200).json({
            success: true,
            imageBase64: image.replace(/^data:image\/\w+;base64,/, ''),
            contentType: 'image/jpeg'
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
```

## Quick Checklist

- [ ] n8n workflow exists
- [ ] Webhook path is `/photo-booth`
- [ ] Workflow is ACTIVE (green toggle)
- [ ] Webhook accepts POST requests
- [ ] Webhook accepts FormData with `image` and `style` fields
- [ ] Workflow returns processed image
- [ ] Full URL matches: `https://naguibdev.app.n8n.cloud/webhook/photo-booth`

## Still Having Issues?

Check n8n logs:
1. Open workflow in n8n
2. Click "Executions" tab
3. Look for failed webhook calls
4. Check error messages

Or contact n8n support if the workflow should be working.
