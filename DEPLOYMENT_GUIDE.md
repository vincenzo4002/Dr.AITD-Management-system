# 🚀 Deployment Guide - Dr. AITD Management System

## 🔴 **Current Issue**
Your Netlify frontend is deployed but **login is not working** because:
- The backend is not deployed yet
- The frontend is trying to connect to a placeholder URL: `https://your-render-app-url.onrender.com`
- Environment variable `VITE_API_URL` is not set in Netlify

## ✅ **Solution Steps**

### **Step 1: Deploy Backend to Render** 🖥️

#### 1.1 Create a Render Account
1. Go to [render.com](https://render.com)
2. Sign up using your GitHub account

#### 1.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Gulshankartikk/College-ERP-main`
3. Configure the service:
   - **Name**: `dr-aitd-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

#### 1.3 Set Environment Variables in Render
Click **"Environment"** tab and add these variables:

```
NODE_ENV=production
PORT=4000
MONGO_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-secure-random-string-minimum-32-characters>
FRONTEND_URL=https://dr-aitd-management-system.netlify.app
```

**Important Notes:**
- For `MONGO_URI`: You need to create a **MongoDB Atlas** account (free tier available)
  - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  - Create a cluster and get your connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/college-erp`
- For `JWT_SECRET`: Generate a secure random string (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

#### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. **Copy your backend URL** (will be something like: `https://dr-aitd-backend.onrender.com`)

---

### **Step 2: Configure Netlify Frontend** 🌐

#### 2.1 Set Environment Variable in Netlify
1. Go to your Netlify dashboard
2. Select your site: **dr-aitd-management-system**
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://dr-aitd-backend.onrender.com` (use your actual Render backend URL)
6. Click **"Save"**

#### 2.2 Redeploy Frontend
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment to complete (2-3 minutes)

---

### **Step 3: Verify Everything Works** ✅

1. Visit: `https://dr-aitd-management-system.netlify.app/login`
2. Try logging in with test credentials
3. Check browser console for any errors (F12 → Console tab)

---

## 🔧 **Alternative: Quick Fix for Testing**

If you just want to test locally first:

1. **Start your local backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Update frontend to use local backend**:
   - Create a `.env.local` file in the `frontend` folder
   - Add: `VITE_API_URL=http://localhost:4000`

3. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📝 **Default Test Credentials**

After backend is deployed and seeded, you can use:

**Admin:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

---

## 🆘 **Troubleshooting**

### Issue: "Network Error" on login
- **Cause**: Backend URL is incorrect or backend is not running
- **Fix**: Verify `VITE_API_URL` in Netlify matches your Render backend URL

### Issue: "CORS Error"
- **Cause**: Backend CORS not configured for frontend URL
- **Fix**: Ensure `FRONTEND_URL` environment variable in Render is set correctly

### Issue: "MongoDB Connection Error"
- **Cause**: Invalid MongoDB connection string
- **Fix**: Double-check your MongoDB Atlas connection string and ensure IP whitelist allows connections

### Issue: "401 Unauthorized" after login
- **Cause**: JWT_SECRET mismatch or token issues
- **Fix**: Ensure JWT_SECRET is set in backend environment variables

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Netlify deploy logs: Dashboard → Deploys → Click on latest deploy
3. Check browser console for frontend errors (F12 → Console)

---

## 🎯 **Next Steps After Deployment**

1. ✅ Seed your database with initial data
2. ✅ Test all features (login, registration, dashboard)
3. ✅ Set up custom domain (optional)
4. ✅ Enable HTTPS (automatic on both platforms)
5. ✅ Monitor application performance

---

**Good luck with your deployment! 🚀**
