# 🚨 QUICK FIX: Login Not Working on Netlify

## **Problem**
Your site is deployed at https://dr-aitd-management-system.netlify.app/ but login doesn't work because the **backend is not deployed yet**.

## **Quick Solution (3 Steps)**

### **1️⃣ Deploy Backend on Render (Free)**

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repo: `Gulshankartikk/College-ERP-main`
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   MONGO_URI=<your-mongodb-atlas-url>
   JWT_SECRET=<random-32-char-string>
   FRONTEND_URL=https://dr-aitd-management-system.netlify.app
   ```
6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://dr-aitd-backend.onrender.com`)

### **2️⃣ Configure Netlify**

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site → **Site settings** → **Environment variables**
3. Add variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://dr-aitd-backend.onrender.com` (your Render URL)
4. Save

### **3️⃣ Redeploy Netlify**

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait 2-3 minutes
4. ✅ **Login should now work!**

---

## **Need MongoDB?**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/college-erp`
4. Use it as `MONGO_URI` in Render

---

## **Test Credentials**

After deployment, seed your database and use:

- **Admin**: `admin@college.edu` / `admin123`
- **Teacher**: `teacher@college.edu` / `teacher123`
- **Student**: `student@college.edu` / `student123`

---

📖 **For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**
