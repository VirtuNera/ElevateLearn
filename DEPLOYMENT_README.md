# 🚀 Deployment Guide for Elevate360 LMS

This guide explains how to deploy the frontend of your Elevate360 LMS application to GitHub Pages using GitHub Actions.

## 📋 Prerequisites

1. **GitHub Repository**: Your project must be hosted on GitHub
2. **GitHub Pages Enabled**: Pages must be enabled in your repository settings
3. **Proper Branch Structure**: The workflow expects a `main` or `master` branch

## ⚙️ Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Set **Source** to "GitHub Actions"
4. Click **Save**

### 2. Repository Structure

Your project has this structure:
```
ElevateLearn/
├── client/           # React frontend
├── server/           # Express backend
├── dist/             # Build output
│   └── public/       # Frontend build (for GitHub Pages)
└── .github/workflows/
    └── deploy.yml    # GitHub Actions workflow
```

### 3. Build Scripts

- `npm run build` - Builds both frontend and backend
- `npm run build:frontend` - Builds only the frontend (used by GitHub Actions)
- `npm run dev` - Development server
- `npm start` - Production server

## 🔄 How the Workflow Works

### Trigger
- **Automatic**: On push to `main` or `master` branch
- **Manual**: Via workflow dispatch
- **Preview**: On pull requests

### Build Process
1. **Checkout** repository
2. **Setup Node.js 18** with npm caching
3. **Install dependencies** using `npm ci`
4. **Build frontend** using `npm run build:frontend`
5. **Configure Pages** settings
6. **Upload artifacts** from `./dist/public`

### Deployment
- **Automatic deployment** to GitHub Pages
- **Environment protection** with proper permissions
- **Concurrency control** to prevent conflicts

## 🎯 What Gets Deployed

Only the **frontend React application** is deployed to GitHub Pages:
- ✅ React components and UI
- ✅ CSS and styling
- ✅ Client-side JavaScript
- ✅ Static assets

**Backend services are NOT deployed** to GitHub Pages (they need a separate hosting solution).

## 🔧 Customization

### Environment Variables
If you need environment variables for the frontend build, add them to the workflow:

```yaml
- name: Build frontend only
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
  run: npm run build:frontend
```

### Build Output Path
The workflow expects the frontend build in `./dist/public`. If you change this in `vite.config.ts`, update the workflow accordingly.

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that `npm run build:frontend` works locally
   - Verify all dependencies are in `package.json`

2. **Deployment Fails**
   - Ensure GitHub Pages is enabled
   - Check repository permissions
   - Verify the `gh-pages` branch is created automatically

3. **Frontend Not Loading**
   - Check browser console for errors
   - Verify the build output path in `vite.config.ts`
   - Ensure client-side routing is configured for GitHub Pages

### Manual Deployment

If automatic deployment fails, you can:
1. Go to **Actions** tab in your repository
2. Select the **Deploy Frontend to GitHub Pages** workflow
3. Click **Run workflow**
4. Select your branch and click **Run workflow**

## 📱 Accessing Your Deployed App

Once deployed, your app will be available at:
```
https://[username].github.io/[repository-name]/
```

## 🔄 Updating the Deployment

Every time you push to your main branch, the workflow will automatically:
1. Build the latest version of your frontend
2. Deploy it to GitHub Pages
3. Update the live site

No manual intervention required! 🎉
