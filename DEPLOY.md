# NARC4S Deployment Guide 🚀

## 📦 Vercel Deployment (Recommended)

### 1️⃣ Backend Deployment

```bash
# Navigate to backend
cd packages/backend

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# - TWITTER_API_KEY
# - TWITTER_API_KEY_SECRET  
# - TWITTER_ACCESS_TOKEN
# - TWITTER_ACCESS_TOKEN_SECRET
# - TWITTER_BEARER_TOKEN
```

**Expected URL:** `https://narc4s-backend.vercel.app`

### 2️⃣ Frontend Deployment

```bash
# Navigate to frontend
cd packages/nextjs

# Deploy to Vercel
vercel --prod

# Environment variables (auto-configured):
# - NEXT_PUBLIC_BACKEND_URL=https://narc4s-backend.vercel.app
# - NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
```

**Expected URL:** `https://narc4s-frontend.vercel.app`

## 🔧 Environment Variables Setup

### Backend (Vercel Dashboard):
1. Go to your backend project settings
2. Add these secrets:
   - `TWITTER_API_KEY` → Your Twitter API key
   - `TWITTER_API_KEY_SECRET` → Your Twitter API secret
   - `TWITTER_ACCESS_TOKEN` → Your Twitter access token
   - `TWITTER_ACCESS_TOKEN_SECRET` → Your Twitter access secret
   - `TWITTER_BEARER_TOKEN` → Your Twitter bearer token

### Frontend (Auto-configured):
- `NEXT_PUBLIC_BACKEND_URL` → Points to deployed backend
- `NEXT_PUBLIC_MONAD_RPC` → Monad testnet RPC

## 🧪 Testing Deployment

### Backend Health Check:
```bash
curl https://narc4s-backend.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-10-04T...",
  "service": "NARC4S Backend", 
  "version": "2.0"
}
```

### Frontend Test:
1. Visit `https://narc4s-frontend.vercel.app`
2. Connect wallet
3. Create a test raffle
4. Verify backend integration works

## 🔄 Alternative: Monorepo Deployment

Deploy both from root directory:
```bash
# From project root
vercel --prod
```

This uses the root `vercel.json` configuration.

## 🚨 Troubleshooting

### Common Issues:

1. **FUNCTION_INVOCATION_FAILED**
   - Check environment variables are set
   - Verify API routes are in `/api/` directory
   - Check function timeout limits

2. **CORS Errors**
   - Verify CORS headers in API functions
   - Check frontend URL is allowed

3. **Twitter API Errors**
   - Verify all Twitter API keys are correct
   - Check rate limits
   - Ensure proper permissions

### Debug Commands:
```bash
# Check deployment logs
vercel logs [deployment-url]

# Local development
vercel dev
```

## 📊 Deployment URLs

After successful deployment:

- **Frontend:** `https://narc4s-frontend.vercel.app`
- **Backend:** `https://narc4s-backend.vercel.app`
- **API Health:** `https://narc4s-backend.vercel.app/api/health`
- **API Raffle:** `https://narc4s-backend.vercel.app/api/process-raffle`

## 🎯 Production Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Environment variables configured
- [ ] Twitter API integration working
- [ ] Wallet connection functional
- [ ] Raffle creation working
- [ ] VRF randomness operational
- [ ] Error handling working
- [ ] CORS properly configured
- [ ] Rate limiting handled

---

**Ready for production! 🎉**
