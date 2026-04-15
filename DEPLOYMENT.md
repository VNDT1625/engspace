# EngSpace Deployment Guide

This guide covers deploying EngSpace to production using Vercel (Frontend) and Render (Backend & AI Service).

## Overview

EngSpace consists of 3 services:
- **Frontend**: React + Vite → Deployed on Vercel
- **Backend**: Node.js + Express + MongoDB → Deployed on Render
- **AI Service**: Python + FastAPI → Deployed on Render

## Prerequisites

1. **GitHub Account** - Push your code
2. **Vercel Account** - https://vercel.com (connect GitHub)
3. **Render Account** - https://render.com (connect GitHub)
4. **Hugging Face Account** - https://huggingface.co (for AI model access)
5. **MongoDB** - Free tier on MongoDB Atlas or Render PostgreSQL

---

## 1. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd eng-space/frontend
npm install
npm run build
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Set root directory to `eng-space/frontend`
4. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:
```
VITE_API_URL = https://your-backend-url.onrender.com
```

### Step 4: Redeploy

After setting environment variables, redeploy by pushing to main branch or manually redeploy from Vercel dashboard.

---

## 2. Backend Deployment (Render)

### Step 1: Create MongoDB Database

**Option A: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/engspace`

**Option B: Render PostgreSQL**
- Render offers free PostgreSQL; requires code changes

### Step 2: Deploy Backend to Render

1. Go to https://render.com/dashboard
2. Click "New" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `eng-space/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In Render dashboard → Environment:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/engspace
JWT_SECRET=your_very_secure_random_key_here_min_32_chars
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
AI_SERVICE_URL=https://your-ai-service-url.onrender.com
```

### Step 4: Configure Render Database

If using Render's database:
1. Create PostgreSQL database
2. Get connection details
3. Update `MONGO_URI` or modify backend to use PostgreSQL

---

## 3. AI Service Deployment (Render)

### Prerequisites

- Hugging Face Account with API token
- Sufficient Render credits (AI service requires more resources)

### Step 1: Prepare AI Service

1. Ensure `requirements.txt` is up to date
2. Create `.env` file from `.env.example`:
```bash
cd eng-space/ai-service
cp .env.example .env
```

### Step 2: Deploy to Render

1. Go to https://render.com/dashboard
2. Click "New" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `eng-space/ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port 8000`
   - **Plan**: Paid (Standard or higher) - Free tier may timeout

### Step 3: Add Environment Variables

In Render dashboard → Environment:
```
LORA_DIR=VNDT1625/engspace-qwen-lora
HF_TOKEN=hf_your_huggingface_token_here
PORT=8000
TORCH_HOME=/opt/render/.cache/torch
TRANSFORMERS_CACHE=/opt/render/.cache/huggingface
CORS_ORIGIN=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy

Push changes to GitHub; Render will auto-deploy.

---

## 4. Environment Files Reference

Each service has an `.env.example` file. Copy to `.env` and fill in actual values:

### Frontend (.env)
```bash
cp eng-space/frontend/.env.example eng-space/frontend/.env
```

### Backend (.env)
```bash
cp eng-space/backend/.env.example eng-space/backend/.env
```

### AI Service (.env)
```bash
cp eng-space/ai-service/.env.example eng-space/ai-service/.env
```

---

## 5. Connect Services

After all services are deployed, update environment variables:

### Frontend (Vercel)
- Set `VITE_API_URL` to your Render backend URL

### Backend (Render)
- Set `CORS_ORIGIN` to your Vercel frontend URL
- Set `AI_SERVICE_URL` to your Render AI service URL

### AI Service (Render)
- Set `CORS_ORIGIN` to your Vercel frontend URL
- Set `BACKEND_URL` to your Render backend URL

---

## 6. Local Development

### Install Dependencies
```bash
# Frontend
cd eng-space/frontend
npm install

# Backend
cd eng-space/backend
npm install

# AI Service
cd eng-space/ai-service
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### Run Locally
```bash
# Terminal 1: Backend
cd eng-space/backend
npm run dev

# Terminal 2: AI Service
cd eng-space/ai-service
python -m uvicorn app:app --reload

# Terminal 3: Frontend
cd eng-space/frontend
npm run dev
```

---

## 7. Troubleshooting

### Frontend Build Fails
- Check Node version (require 16+)
- Clear `node_modules` and reinstall
- Check `.env` variables

### Backend Connection Issues
- Verify MongoDB URI is correct
- Check JWT_SECRET is set
- Verify CORS_ORIGIN matches frontend URL

### AI Service Timeout
- Upgrade to paid Render plan (free tier times out)
- Check HF_TOKEN is valid
- Model loading takes time on first deploy

### Database Connection
- MongoDB URI syntax: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- Whitelist Render IPs in MongoDB Atlas

---

## 8. Production Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render with MongoDB
- [ ] AI Service deployed on Render
- [ ] All environment variables configured
- [ ] Services can communicate (test API calls)
- [ ] CORS headers configured correctly
- [ ] JWT secret is secure and set
- [ ] Database backups configured
- [ ] Error logging setup (optional)
- [ ] Domain names configured (optional)

---

## 9. Monitoring & Logs

### Vercel
- Dashboard → Deployments → View logs
- Environment → Activity

### Render
- Dashboard → Web Service → Logs
- Alert settings for errors

---

## 10. Cost Estimation

- **Frontend (Vercel)**: Free
- **Backend (Render)**: ~$7/month (Starter)
- **AI Service (Render)**: ~$20+/month (Standard or higher)
- **MongoDB (Atlas)**: Free tier (512MB)
- **Total**: ~$27+/month

---

## 11. Support & Documentation

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- FastAPI: https://fastapi.tiangolo.com
- Express.js: https://expressjs.com
- Vite: https://vitejs.dev
