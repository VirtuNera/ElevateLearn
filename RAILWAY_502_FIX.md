# Railway 502 Error - Complete Fix Guide

## 🔍 **Root Cause Analysis**

The 502 error occurs because Railway's edge proxy can't reach your app. Based on the Railway documentation, this was caused by:

1. **Port Mismatch**: Railway config had `PORT = 8080` but server defaulted to `5000`
2. **Missing Health Check**: No guaranteed health check endpoint
3. **Potential Environment Variable Issues**

## ✅ **Fixes Applied**

### 1. Fixed Port Configuration
- **Before**: `PORT = 8080` in railway.toml
- **After**: `PORT = 5000` in railway.toml
- **Server**: Already correctly uses `process.env.PORT || 5000`

### 2. Added Guaranteed Health Check
- Added `/api/health` endpoint to main server file
- Returns server status, timestamp, and environment info

### 3. Verified CORS Configuration
- CORS properly configured for GitHub Pages domains
- Includes both `https://virtunera.github.io` and `https://virtunera.github.io/ElevateLearn`

## 🚀 **Next Steps**

### 1. Deploy the Fixes
```bash
# Commit and push the changes
git add .
git commit -m "Fix Railway 502 error: port mismatch and health check"
git push
```

### 2. Monitor Railway Deployment
1. Go to Railway dashboard
2. Check deployment logs for any errors
3. Wait for deployment to complete (green status)

### 3. Test the Health Check
Once deployed, test:
```bash
curl https://your-railway-url/api/health
```
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "port": "5000"
}
```

### 4. Update Frontend Railway URL
After confirming the backend works, update your frontend with the correct Railway URL:

#### Option A: Environment Variable
Create `.env.local` in `client` directory:
```bash
VITE_RAILWAY_URL=https://your-actual-railway-url.up.railway.app
```

#### Option B: Hardcode URL
Update `client/src/lib/queryClient.ts`:
```typescript
return 'https://your-actual-railway-url.up.railway.app';
```

### 5. Test Demo Login
1. Rebuild and redeploy frontend
2. Test demo login on GitHub Pages
3. Check console for successful API calls

## 🔧 **Troubleshooting**

### If Still Getting 502 Errors

1. **Check Railway Logs**
   - Go to Railway dashboard → Observability → Logs
   - Look for startup errors or missing environment variables

2. **Verify Environment Variables**
   - Check Railway Variables section
   - Ensure `DATABASE_URL` is set
   - Ensure `NODE_ENV=production`

3. **Test Locally**
   ```bash
   npm run build:backend
   npm start
   curl http://localhost:5000/api/health
   ```

### Common Issues

1. **Database Connection**: If `DATABASE_URL` is missing, app will crash
2. **Build Errors**: Check if `npm run build:backend` succeeds
3. **Port Conflicts**: Ensure no other services use port 5000

## 📊 **Expected Results**

After applying these fixes:
- ✅ Railway health check returns 200 OK
- ✅ No more 502 Bad Gateway errors
- ✅ Demo login works from GitHub Pages
- ✅ CORS errors resolved

## 🎯 **Quick Verification**

Run this in your browser console on GitHub Pages:
```javascript
// Test your Railway URL (replace with actual URL)
fetch('https://your-railway-url/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend working:', data))
  .catch(err => console.log('❌ Backend error:', err));
```

The demo login should now work correctly!
