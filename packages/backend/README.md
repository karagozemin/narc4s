# NARC4S Backend

Twitter API integration service for NARC4S raffle system.

## Ngrok Integration

This backend is configured to work with ngrok for external access. The current ngrok URL is:
```
https://cb372e035a98.ngrok-free.app
```

### Setup

1. **Environment Variables**
   Create a `.env` file with:
   ```env
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_KEY_SECRET=your_twitter_api_key_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   NGROK_URL=https://cb372e035a98.ngrok-free.app
   PORT=3001
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Start Development Server**
   ```bash
   # Regular development
   yarn dev
   
   # With ngrok URL explicitly set
   yarn dev:ngrok
   ```

### Testing

Test the health endpoints:

```bash
# Test local server
yarn test:local

# Test ngrok endpoint
yarn test:health
```

Or manually:
```bash
# Local
curl http://localhost:3001/api/health

# Ngrok (with browser warning skip)
curl -H "ngrok-skip-browser-warning: true" https://cb372e035a98.ngrok-free.app/api/health
```

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/process-raffle` - Process Twitter raffle

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (Backend dev)
- `https://cb372e035a98.ngrok-free.app` (Ngrok tunnel)
- `https://narc4s.vercel.app` (Production frontend)

### Deployment

**Vercel Serverless:**
The API routes in `/api` folder are deployed as Vercel serverless functions.

**Express Server:**
Run `yarn start` for the full Express server with all features.

### Ngrok Configuration

The backend automatically:
- Sets `ngrok-skip-browser-warning` header
- Configures CORS for ngrok domain
- Logs ngrok URL on startup
- Includes ngrok URL in health check response

### Updating Ngrok URL

When your ngrok URL changes:

1. Update the URL in:
   - `.env` file (`NGROK_URL`)
   - `vercel.json` (`env.NGROK_URL`)
   - `package.json` scripts
   - This README

2. Restart the server to pick up changes.
