# Fixing the Demo Login Issue

## Problem
Your frontend is deployed on GitHub Pages at `https://virtunera.github.io` but is trying to make API calls to relative URLs like `/api/login` and `/api/auth/user`. These URLs resolve to `https://virtunera.github.io/api/login` instead of your Railway backend.

## Solution

### Step 1: Find Your Railway URL
1. Go to your Railway dashboard
2. Find your deployed app
3. Copy the URL (it should look like `https://your-app-name.up.railway.app`)

### Step 2: Update the Frontend Configuration

#### Option A: Using Environment Variables (Recommended)
1. Create a `.env.local` file in the `client` directory:
```bash
VITE_RAILWAY_URL=https://your-actual-railway-url.up.railway.app
```

2. Rebuild and redeploy your frontend:
```bash
npm run build:frontend
```

#### Option B: Hardcode the URL
Update `client/src/lib/queryClient.ts` and replace:
```typescript
return 'https://elevatelearn-production.up.railway.app';
```
with your actual Railway URL.

### Step 3: Test the Connection
1. Open your GitHub Pages site
2. Open browser console (F12)
3. Look for the debug logs showing the API URLs
4. Test the health endpoint: `https://your-railway-url.up.railway.app/api/health`

### Step 4: Verify Demo Login Works
1. Click "Demo Login" button
2. Check console for any errors
3. The demo users should load from your Railway backend

## Debugging

### Check Console Logs
The updated code includes debug logging. Look for:
- `API Base URL: ...`
- `Making GET request to: ...`
- `Auth check URL: ...`

### Test Railway URL
Run this in your browser console on GitHub Pages:
```javascript
// Test if your Railway URL is working
fetch('https://your-railway-url.up.railway.app/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Railway working:', data))
  .catch(err => console.log('❌ Railway error:', err));
```

### Common Issues

1. **CORS Error**: Make sure your Railway backend has CORS configured for `https://virtunera.github.io`
2. **Wrong URL**: Double-check your Railway URL
3. **Backend Down**: Verify your Railway app is running

## Files Modified

1. `client/src/lib/queryClient.ts` - Added Railway URL configuration
2. `client/src/hooks/useAuth.ts` - Improved error handling
3. `client/src/components/demo-login.tsx` - Updated to use apiRequest function

## Environment Variables

For production deployment, set these environment variables:
- `VITE_RAILWAY_URL`: Your Railway backend URL

## Next Steps

1. Find your Railway URL
2. Update the configuration
3. Rebuild and redeploy
4. Test the demo login functionality

The demo login should now work correctly, connecting to your Railway backend instead of trying to hit GitHub Pages API endpoints.
