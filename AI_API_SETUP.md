# AI API Setup Guide

The Smart DevCopilot requires an AI API to provide accurate code generation, debugging, and analysis. You have two options:

## 🚀 Quick Setup (Choose One)

### Option 1: Groq API (FREE & Recommended)
```bash
# 1. Get free API key from https://console.groq.com/keys
# 2. Add to backend/.env file:
GROQ_API_KEY=gsk_your_key_here
```
✅ **Free tier**: 30 requests/minute  
✅ **Fast**: <1 second response time  
✅ **Models**: Llama 3.3, Mixtral, Gemma  

### Option 2: OpenAI API (Most Reliable)
```bash
# 1. Get API key from https://platform.openai.com/api-keys
# 2. Add to backend/.env file:
OPENAI_API_KEY=sk-your_key_here
```
✅ **Best quality**: GPT-4o-mini, GPT-4  
✅ **Pay as you go**: ~$0.15 per 1M tokens  
✅ **Stable**: Production-ready  

---

## 📝 Step-by-Step Setup

### 1. Create `.env` File
```bash
cd backend
cp .env.example .env
```

### 2. Edit `.env` File
Open `backend/.env` and add ONE of the API keys:

```env
# Choose one of these:
GROQ_API_KEY=gsk_your_actual_key_here
# OR
OPENAI_API_KEY=sk_your_actual_key_here

# Keep these as is:
DATABASE_URL=sqlite:///./devcopilot.db
HOST=0.0.0.0
PORT=8000
DEBUG=true
SECRET_KEY=your-secret-key-here
```

### 3. Restart Backend Server
```bash
# Stop the server (Ctrl+C) and restart:
cd backend
uvicorn main:app --reload
```

### 4. Test the API
Open http://localhost:8000 - you should see:
```json
{
  "status": "online",
  "service": "Smart DevCopilot API"  
}
```

---

## 🔍 Troubleshooting

### Error: "No AI API configured"
**Solution**: Make sure you set ONE of the API keys in `backend/.env`

### Error: "Invalid API key"
**Solutions**:
- Check the API key is correct (no extra spaces)
- Verify the key hasn't expired
- Make sure you're using the right variable name (GROQ_API_KEY or OPENAI_API_KEY)

### Error: "Rate limit exceeded"
**Solutions**:
- **Groq**: Wait 1 minute (free tier limit)
- **OpenAI**: Check your billing account

### Features not working / Generic responses
**Solution**: The app will automatically try all configured APIs in order:
1. OpenAI (if OPENAI_API_KEY is set)
2. Groq (if GROQ_API_KEY is set)
2. OpenAI (if OPENAI_API_KEY is set)

To guarantee accuracy, use **Groq** (free) or **OpenAI
---

## 💡 Recommendations

### For Development/Testing:
**Use Groq** - Free, fast, good enough for testing

### For Production:quality

### For Production:
**Use OpenAI** - Most reliable, best quality, cost-effective

## 📊 API Comparison

| Feature | Groq | OpenAI | Poe |
|---------|------|--------|-----|
| **Cost** | Free | Pay-per-use | $20/month |
| **Speed** | Very Fast | Fast | Medium |
| **Quality** | Good | Excellent | Varies |
| **Limits** | 30 req/min |
|---------|------|--------|
| **Cost** | Free | Pay-per-use |
| **Speed** | Very Fast | Fast |
| **Quality** | Very Good | Excellent |
| **Limits** | 30 req/min | Pay as you go |
| **Models** | Llama, Mixtral | GPT-4o-mini |
| **Best For** | Development | Production |
1. Check the terminal for error messages
2. Verify your `.env` file configuration
3. Test your API key directly at the provider's website
4. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help

---

## ✅ Verification

Once configured correctly, you should see this in the backend console:
```
✅ Using OpenAI API with GPT-4o-mini
# OR
✅ Using Groq API with Llama 3.3
# OR  
✅ Using Poe API with Claude-3-Opus
```
Groq API with Llama 3.3
# OR
✅ Using OpenAI API with GPT-4o-mini