# Fix CORS Error for n8n Webhook

## Problem
The browser is blocking requests to your n8n webhook due to CORS (Cross-Origin Resource Sharing) policy.

## Solution: Configure n8n Webhook with CORS Headers

### Method 1: Add Response Headers in n8n Workflow

1. **Open your n8n workflow** (photo-booth webhook)

2. **Add/Modify the "Respond to Webhook" node** at the end of your workflow

3. **Add Response Headers** in the "Respond to Webhook" node:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS, GET
   Access-Control-Allow-Headers: Content-Type
   ```

4. **Handle OPTIONS preflight requests** - Add a separate branch for OPTIONS:
   - Add an "IF" node after webhook trigger
   - Condition: `{{ $json.query.httpMethod === 'OPTIONS' }}`
   - If true: Return 200 with CORS headers immediately
   - If false: Continue with normal processing

### Method 2: Simple n8n Workflow Structure

```
Webhook Trigger (photo-booth)
    ↓
IF Node (Check if OPTIONS request)
    ↓
[TRUE] → Respond to Webhook (200, CORS headers only)
    ↓
[FALSE] → Your Processing Nodes (AI, image processing, etc.)
    ↓
Respond to Webhook (Return processed image + CORS headers)
```

### Example n8n "Respond to Webhook" Headers:

**Options**:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
}
```

**Response with Image**:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "image/png"
}
```

### Method 3: Alternative - Deploy with Same Domain

If you deploy the photo booth app on the same domain as n8n (e.g., using Vercel with custom domain), CORS won't be an issue.

## Testing

After configuring CORS in n8n:
1. Refresh your photo booth page
2. Take a photo and approve it
3. Check browser console - CORS error should be gone
4. Image should process successfully

## Note

Using `Access-Control-Allow-Origin: *` allows all domains. For production, you should restrict it to your specific domain:
```
Access-Control-Allow-Origin: https://your-photobooth-domain.com
```
