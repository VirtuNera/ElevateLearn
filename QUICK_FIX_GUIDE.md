# Quick Fix for CORS and Railway URL Issues

## Current Issues
1. **CORS Error**: Backend not allowing requests from your GitHub Pages domain
2. **502 Bad Gateway**: Wrong Railway URL or backend is down

## Immediate Steps

### 1. Find Your Correct Railway URL
1. Go to your Railway dashboard: https://railway.app/dashboard
2. Find your deployed app
3. Copy the URL (should look like `https://your-app-name.up.railway.app`)

### 2. Test the URL
Run this in your browser console on GitHub Pages:
```javascript
// Test your Railway URL
fetch('https://YOUR-ACTUAL-RAILWAY-URL/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Working:', data))
  .catch(err => console.log('❌ Error:', err));
```

### 3. Update Frontend Configuration

#### Option A: Environment Variable (Recommended)
1. Create `.env.local` in the `client` directory:
```bash
VITE_RAILWAY_URL=https://your-actual-railway-url.up.railway.app
```

2. Rebuild frontend:
```bash
npm run build:frontend
```

#### Option B: Hardcode URL
Update `client/src/lib/queryClient.ts` line ~15:
```typescript
return 'https://your-actual-railway-url.up.railway.app';
```

### 4. Deploy Backend Changes
The CORS configuration has been updated. Deploy your backend to Railway:
```bash
git add .
git commit -m "Fix CORS configuration"
git push
```

### 5. Test Again
1. Wait for Railway deployment to complete
2. Test demo login on GitHub Pages
3. Check console for any remaining errors

## Debugging

### Check Railway Deployment
1. Go to Railway dashboard
2. Check if your app is running (green status)
3. Check logs for any errors

### Common Railway URLs to Try
- `https://elevatelearn.up.railway.app`
- `https://elevate360-lms.up.railway.app`
- `https://elevatelearn-lms.up.railway.app`
- `https://elevatelearn-backend.up.railway.app`

### If Still Getting CORS Errors
The backend CORS has been updated to include:
- `https://virtunera.github.io`
- `https://virtunera.github.io/ElevateLearn`
- Local development URLs

Make sure to redeploy your backend after the CORS changes.

## Expected Result
After fixing the Railway URL and redeploying the backend:
- Demo login should work
- No more CORS errors
- No more 502 Bad Gateway errors
