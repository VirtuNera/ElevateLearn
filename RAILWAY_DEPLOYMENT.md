# 🚀 Railway Backend Deployment Guide

This guide will help you deploy your Elevate360 LMS backend to Railway.

## 📋 Prerequisites

1. **GitHub Account** (you already have this)
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Database** - Your Neon database (already configured)

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Commit the new Railway files**:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Verify these files are in your repo**:
   - ✅ `railway.toml`
   - ✅ `.railwayignore`
   - ✅ Health check endpoint in `server/routes.ts`
   - ✅ `build:backend` script in `package.json`

### **Step 2: Connect Railway to GitHub**

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**: `virtunera/ElevateLearn`
5. **Select the branch**: `main`

### **Step 3: Configure Environment Variables**

Railway will automatically detect your project. Now you need to set up environment variables:

1. **Go to your project's "Variables" tab**
2. **Add these environment variables**:

   ```bash
   # Database
   DATABASE_URL=your_neon_database_url_here
   
   # JWT Secret (generate a new one for production)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Google OAuth (if using)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Session Secret
   SESSION_SECRET=your_session_secret_here
   
   # CORS Origins (add your GitHub Pages URL)
   CORS_ORIGINS=https://virtunera.github.io
   ```

3. **Click "Add" for each variable**

### **Step 4: Deploy**

1. **Railway will automatically start building** when you push to main
2. **Monitor the build logs** in the "Deployments" tab
3. **Wait for successful deployment** (usually 2-5 minutes)

### **Step 5: Get Your Backend URL**

1. **Go to "Settings" tab**
2. **Copy your "Domain"** (e.g., `https://your-app-name.railway.app`)
3. **This is your backend API URL!**

## 🔄 Update Frontend Configuration

Once deployed, update your frontend to use the Railway backend:

### **Option 1: Update Vite Config (Recommended)**

Update `vite.config.ts` to proxy to Railway in development:

```typescript
server: {
  proxy: {
    "/api": {
      target: process.env.NODE_ENV === 'production' 
        ? "https://your-app-name.railway.app" 
        : "http://localhost:5000",
      changeOrigin: true,
      secure: false,
    },
  },
},
```

### **Option 2: Update Frontend API Calls**

Update your frontend components to use the Railway URL in production.

## 🧪 Test Your Deployment

1. **Test the health endpoint**: `https://your-app-name.railway.app/api/health`
2. **Should return**: `{"status":"healthy","timestamp":"...","environment":"production"}`

## 🚨 Troubleshooting

### **Build Fails**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

### **Runtime Errors**
- Check Railway logs in "Deployments" tab
- Verify environment variables are set correctly
- Check database connectivity

### **CORS Issues**
- Ensure `CORS_ORIGINS` includes your GitHub Pages URL
- Check that your frontend is making requests to the correct backend URL

## 🔒 Security Notes

1. **Never commit `.env` files**
2. **Use strong, unique secrets for production**
3. **Consider setting up a custom domain** for your Railway app
4. **Enable Railway's built-in security features**

## 📊 Monitoring

Railway provides:
- **Real-time logs**
- **Performance metrics**
- **Automatic restarts** on failure
- **Health checks**

## 🎯 Next Steps

After successful deployment:

1. **Test all API endpoints**
2. **Update your frontend** to use the Railway backend
3. **Set up monitoring** and alerts
4. **Consider setting up a custom domain**

## 🆘 Need Help?

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Check your Railway logs** for specific error messages

---

**Good luck with your deployment! 🚀**
