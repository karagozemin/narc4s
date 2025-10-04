# 🔗 Ngrok Integration Setup Guide

This guide explains how to properly integrate and use ngrok with the NARC4S backend.

## Current Configuration

**Ngrok URL:** `https://cb372e035a98.ngrok-free.app`

## 🚀 Quick Setup

### 1. Install ngrok (if not already installed)
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start your backend
```bash
cd packages/backend
yarn dev
```
Your backend will run on `http://localhost:3001`

### 3. Start ngrok tunnel
```bash
# In a new terminal
ngrok http 3001
```

This will create a tunnel from your ngrok URL to `localhost:3001`.

### 4. Update configuration (if URL changed)
If ngrok gives you a new URL, update it in:
- `packages/backend/vercel.json` (line 21)
- `packages/backend/config.js` (line 7)
- `packages/backend/README.md`
- `packages/backend/NGROK_SETUP.md` (this file)
- `packages/backend/test-ngrok.js`

## 🧪 Testing the Integration

### Method 1: Using the test script
```bash
yarn test:ngrok
```

### Method 2: Manual testing
```bash
# Test health endpoint
curl -H "ngrok-skip-browser-warning: true" https://cb372e035a98.ngrok-free.app/api/health

# Test from browser (visit in browser)
https://cb372e035a98.ngrok-free.app/api/health
```

### Method 3: Test with frontend
Make sure your frontend is configured to use the ngrok URL for API calls.

## 🔧 Configuration Details

### Backend Changes Made:
1. **CORS Configuration**: Added ngrok domain to allowed origins
2. **Headers**: Added `ngrok-skip-browser-warning` header support
3. **Environment Variables**: Added `NGROK_URL` configuration
4. **Health Endpoint**: Now returns ngrok URL information
5. **Startup Logs**: Shows both local and ngrok URLs

### Files Modified:
- `server.js` - Express server with ngrok CORS
- `api/health.js` - Vercel serverless function
- `api/process-raffle.js` - Vercel serverless function  
- `vercel.json` - Environment variables
- `package.json` - Added test scripts
- `config.js` - Centralized configuration

## 🌐 Frontend Integration

Update your frontend to use the ngrok URL:

```javascript
// In your frontend API configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'https://cb372e035a98.ngrok-free.app'
  : 'https://your-production-api.com';

// When making requests, include the header
fetch(`${API_BASE_URL}/api/health`, {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});
```

## 🔄 When Ngrok URL Changes

Ngrok free tier gives you a new URL each time you restart. When this happens:

1. **Update all configuration files** with the new URL
2. **Restart your backend** to pick up changes
3. **Update your frontend** configuration
4. **Test the integration** using `yarn test:ngrok`

## 🚨 Common Issues

### Issue: "Connection refused" or 8012 error
**Solution:** Make sure your backend is running on port 3001 before starting ngrok.

### Issue: CORS errors in browser
**Solution:** Ensure the ngrok URL is added to CORS allowed origins in `server.js`.

### Issue: Ngrok browser warning
**Solution:** Add `ngrok-skip-browser-warning: true` header to all requests.

### Issue: 404 on API routes
**Solution:** Check that ngrok is forwarding to the correct port (3001).

## 📊 Monitoring

Check if everything is working:

```bash
# Check if backend is running
lsof -i :3001

# Check ngrok status
curl -H "ngrok-skip-browser-warning: true" https://cb372e035a98.ngrok-free.app/api/health

# View ngrok web interface
# Visit http://127.0.0.1:4040 in your browser
```

## 🔐 Security Notes

- Ngrok exposes your local server to the internet
- Only use for development/testing
- Don't commit sensitive data in configuration files
- Consider ngrok auth for additional security

## 🎯 Production Deployment

For production, replace ngrok with:
- Vercel deployment (for serverless functions)
- Railway, Render, or similar for full Express server
- AWS, GCP, or Azure cloud services
