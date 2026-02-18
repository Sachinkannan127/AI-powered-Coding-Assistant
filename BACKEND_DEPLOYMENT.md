# Quick Backend Deployment Guide

## 🚀 Deploy Backend to Railway (Easiest)

### Prerequisites
- GitHub repository (you already have this)

### Steps:

#### 1. Sign Up for Railway
- Go to https://railway.app
- Sign in with GitHub
- It's FREE for starter projects

#### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `AI-powered-Coding-Assistant` repository
4. Railway will detect it's a Python project

#### 3. Configure Service
1. Click on the deployed service
2. Go to **Settings** → **Root Directory**
3. Set to: `backend`

#### 4. Add Environment Variables
Go to **Variables** tab and add:

```
GEMINI_API_KEY=your-gemini-api-key-here
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./devcopilot.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Generate a SECRET_KEY:
```python
import secrets
print(secrets.token_hex(32))
```

#### 5. Deploy
1. Railway will automatically deploy
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, click **Settings** → **Domains**
4. Click **Generate Domain**
5. Copy the URL (e.g., `https://your-app.railway.app`)

#### 6. Update Vercel with Backend URL
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add:
   ```
   VITE_API_BASE_URL=https://your-app.railway.app
   ```
4. Redeploy

---

## Alternative: Deploy to Render

### Steps:

#### 1. Sign Up
- Go to https://render.com
- Sign in with GitHub

#### 2. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name**: devcopilot-backend
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 3. Add Environment Variables
Add the same variables as Railway

#### 4. Deploy
- Click **"Create Web Service"**
- Wait for deployment
- Copy the URL

---

## ⚡ Quick Test

After deploying backend, test it:

```bash
# Replace with your backend URL
curl https://your-backend.railway.app/

# Should return:
# {"status":"online","message":"Smart DevCopilot API is running",...}
```

---

## 📋 Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL accessible (test with curl/browser)
- [ ] Environment variables set in backend
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Vercel redeployed
- [ ] Test registration on Vercel app

---

## 🐛 Still Not Working?

### Check Backend Logs
**Railway**: Dashboard → Service → Logs
**Render**: Dashboard → Service → Logs

### Common Issues:

**1. "Network error"**
- Backend not accessible
- Wrong URL in `VITE_API_BASE_URL`
- Backend not deployed

**2. "CORS error"**
- Already fixed (backend allows all origins)

**3. "Database error"**
- Railway/Render should auto-create SQLite db
- Check backend logs

**4. "Registration failed"**
- Check backend logs for specific error
- Might be validation error

### Debug:

```bash
# Test backend directly:
curl -X POST https://your-backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

---

## 💡 Pro Tip

For now, keep it simple:
1. Deploy backend to Railway (5 minutes)
2. Set `VITE_API_BASE_URL` in Vercel
3. Redeploy frontend
4. Test!

The free tier of Railway is sufficient for testing and small projects.
