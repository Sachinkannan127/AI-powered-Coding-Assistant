# Frontend Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Backend API deployed and accessible via HTTPS
- Code pushed to GitHub/GitLab/Bitbucket

---

## Method 1: Vercel Dashboard (Easiest)

### Step 1: Import Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your repository
5. Click **"Import"**

### Step 2: Configure Build Settings
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.com` | Production |

**Example:**
```
VITE_API_BASE_URL=https://api.yourapp.com
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app is live! 🎉

---

## Method 2: Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Navigate to Frontend
```bash
cd frontend
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
# First deployment (preview)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (enter name)
# - In which directory is your code? ./
# - Want to override settings? No
```

### Step 5: Add Environment Variables
```bash
# Add production environment variable
vercel env add VITE_API_BASE_URL production
# Enter value: https://your-backend.com

# Pull environment variables for local
vercel env pull
```

### Step 6: Deploy to Production
```bash
vercel --prod
```

---

## Method 3: Other Platforms

### Netlify

1. **Via Dashboard:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect Git repository
   - Configure:
     ```
     Build command: npm run build
     Publish directory: dist
     Base directory: frontend
     ```
   - Add environment variable: `VITE_API_BASE_URL`
   - Click "Deploy"

2. **Via CLI:**
   ```bash
   npm install -g netlify-cli
   cd frontend
   netlify login
   netlify init
   netlify deploy --prod
   ```

### AWS Amplify

1. Go to AWS Amplify Console
2. Connect repository
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
   ```
4. Add environment variable: `VITE_API_BASE_URL`
5. Deploy

### GitHub Pages

```bash
cd frontend

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

---

## Environment Variables Reference

### Local Development (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production (`.env.production` or Vercel/Netlify dashboard)
```env
VITE_API_BASE_URL=https://your-production-api.com
```

### Optional Variables
```env
# API request timeout (milliseconds)
VITE_API_TIMEOUT=30000

# Enable debug mode
VITE_DEBUG=false
```

---

## Backend CORS Configuration

⚠️ **Important:** Your backend must allow CORS from your frontend domain.

Update `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",  # Add your Vercel domain
        "http://localhost:5173",             # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Troubleshooting

### Build Fails
- **Check Node version:** Vercel uses Node 18+ by default
- **Check dependencies:** Make sure all packages are in `package.json`
- **Clear cache:** In Vercel, Settings → General → Clear Build Cache

### API Calls Fail
- **Check CORS:** Backend must allow your frontend domain
- **Check HTTPS:** Production backend must use HTTPS
- **Check environment variable:** Ensure `VITE_API_BASE_URL` is set correctly
- **Check console:** Open browser DevTools → Console for errors

### 404 on Refresh
- **Vercel:** Already configured in `vercel.json`
- **Netlify:** Add `_redirects` file:
  ```
  /*    /index.html   200
  ```

### Environment Variable Not Working
- **Prefix required:** Vite only exposes variables with `VITE_` prefix
- **Rebuild required:** Changes require rebuild: `npm run build`
- **Client-side only:** These variables are exposed to browser (don't store secrets)

---

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Add DNS records as instructed
4. Wait for SSL certificate (automatic)

### Netlify
1. Go to Domain Settings → Add custom domain
2. Follow DNS configuration steps
3. SSL is automatic

---

## Performance Optimization

### 1. Enable Compression
Vercel automatically compresses assets with Brotli/Gzip.

### 2. Optimize Build
```bash
# In package.json, build script can use:
"build": "vite build --mode production"
```

### 3. CDN
Both Vercel and Netlify use global CDN automatically.

### 4. Code Splitting
Vite automatically code-splits. Keep your bundle size small:
```bash
npm run build
# Check dist/ folder size
```

---

## CI/CD

### Auto-Deploy on Git Push
Both Vercel and Netlify automatically deploy when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### Preview Deployments
Every pull request gets a unique preview URL for testing.

---

## Monitoring

### Vercel Analytics
1. Go to Project → Analytics
2. View:
   - Page views
   - Performance metrics
   - Web Vitals

### Custom Analytics
Add to `index.html`:
- Google Analytics
- Plausible
- Mixpanel

---

## Cost

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ HTTPS/SSL included
- ✅ CDN included
- ✅ Preview deployments

### Netlify Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ HTTPS/SSL included

Both are sufficient for most projects!

---

## Quick Reference Commands

```bash
# Vercel
vercel                    # Deploy preview
vercel --prod            # Deploy production
vercel env ls            # List environment variables
vercel logs              # View deployment logs
vercel domains ls        # List domains

# Netlify
netlify deploy           # Deploy preview
netlify deploy --prod    # Deploy production
netlify env:list         # List environment variables
netlify open             # Open dashboard
```

---

## Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Set up custom domain (optional)
3. ✅ Enable analytics (optional)
4. ✅ Set up monitoring/error tracking (Sentry, LogRocket)
5. ✅ Configure backend CORS for production domain
6. ✅ Update authentication redirects if needed

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Vite Docs:** https://vitejs.dev/guide/

Need help? Check the troubleshooting section or consult platform documentation.
