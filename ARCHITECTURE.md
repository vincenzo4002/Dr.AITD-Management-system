# 🏗️ Dr. AITD Management System - Architecture Overview

## **Current Status** 🔴

```
┌─────────────────────────────────────────────────────────────┐
│                     CURRENT SITUATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Frontend: DEPLOYED on Netlify                           │
│     URL: https://dr-aitd-management-system.netlify.app/     │
│                                                              │
│  ❌ Backend: NOT DEPLOYED                                   │
│     Status: Only running locally                            │
│                                                              │
│  ❌ Database: NOT SET UP                                    │
│     Status: Needs MongoDB Atlas                             │
│                                                              │
│  🚨 RESULT: Login doesn't work!                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## **Target Architecture** ✅

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                             │
└──────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │     USERS       │
    │   (Browser)     │
    └────────┬────────┘
             │
             │ HTTPS
             ▼
    ┌─────────────────────────────────────┐
    │         NETLIFY (Frontend)          │
    │  dr-aitd-management-system.netlify  │
    │                                     │
    │  • React + Vite                     │
    │  • Static Files (HTML/CSS/JS)       │
    │  • Environment: VITE_API_URL        │
    └──────────────┬──────────────────────┘
                   │
                   │ API Calls (HTTPS)
                   │ axios requests
                   ▼
    ┌─────────────────────────────────────┐
    │         RENDER (Backend)            │
    │    dr-aitd-backend.onrender.com     │
    │                                     │
    │  • Node.js + Express                │
    │  • REST API                         │
    │  • JWT Authentication               │
    │  • File Uploads                     │
    │  • Environment Variables:           │
    │    - NODE_ENV=production            │
    │    - PORT=4000                      │
    │    - MONGO_URI                      │
    │    - JWT_SECRET                     │
    │    - FRONTEND_URL                   │
    └──────────────┬──────────────────────┘
                   │
                   │ Database Queries
                   │ Mongoose ODM
                   ▼
    ┌─────────────────────────────────────┐
    │      MONGODB ATLAS (Database)       │
    │                                     │
    │  • Cloud Database (Free Tier)       │
    │  • Collections:                     │
    │    - users                          │
    │    - courses                        │
    │    - subjects                       │
    │    - assignments                    │
    │    - notices                        │
    │    - etc.                           │
    └─────────────────────────────────────┘
```

## **Data Flow** 🔄

### **Login Process Example:**

```
1. User visits: https://dr-aitd-management-system.netlify.app/login
   ↓
2. User enters credentials and clicks "Sign In"
   ↓
3. Frontend sends POST request to:
   https://dr-aitd-backend.onrender.com/api/auth/login
   ↓
4. Backend validates credentials against MongoDB Atlas
   ↓
5. Backend generates JWT token
   ↓
6. Backend sends token back to frontend
   ↓
7. Frontend stores token in localStorage/cookies
   ↓
8. Frontend redirects to dashboard
   ↓
9. All subsequent API calls include JWT token in headers
```

## **Environment Variables Setup** ⚙️

### **Frontend (Netlify)**
```bash
VITE_API_URL=https://dr-aitd-backend.onrender.com
```

### **Backend (Render)**
```bash
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college-erp
JWT_SECRET=your_super_secure_random_32_character_string_here
FRONTEND_URL=https://dr-aitd-management-system.netlify.app
```

## **Deployment Checklist** ✅

- [ ] **1. MongoDB Atlas Setup**
  - [ ] Create account at mongodb.com
  - [ ] Create free cluster
  - [ ] Create database user
  - [ ] Whitelist IP (0.0.0.0/0 for all IPs)
  - [ ] Get connection string

- [ ] **2. Render Backend Deployment**
  - [ ] Create Render account
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Add environment variables
  - [ ] Deploy and get backend URL

- [ ] **3. Netlify Frontend Configuration**
  - [ ] Go to Netlify dashboard
  - [ ] Add VITE_API_URL environment variable
  - [ ] Trigger redeploy
  - [ ] Verify deployment

- [ ] **4. Testing**
  - [ ] Visit deployed site
  - [ ] Test login functionality
  - [ ] Check browser console for errors
  - [ ] Test all major features

## **Cost Breakdown** 💰

```
┌─────────────────┬──────────────┬─────────────┐
│ Service         │ Tier         │ Cost        │
├─────────────────┼──────────────┼─────────────┤
│ Netlify         │ Free         │ $0/month    │
│ Render          │ Free         │ $0/month    │
│ MongoDB Atlas   │ Free (M0)    │ $0/month    │
├─────────────────┼──────────────┼─────────────┤
│ TOTAL           │              │ $0/month    │
└─────────────────┴──────────────┴─────────────┘

Note: Free tiers have limitations:
- Render: Spins down after 15 min of inactivity
- MongoDB: 512 MB storage limit
- Netlify: 100 GB bandwidth/month
```

## **Troubleshooting Guide** 🔧

### **Issue: "Network Error" on login**
```
Cause: Backend URL is incorrect or backend is down
Fix: 
1. Check VITE_API_URL in Netlify
2. Verify backend is running on Render
3. Check Render logs for errors
```

### **Issue: "CORS Error"**
```
Cause: CORS not configured properly
Fix:
1. Ensure FRONTEND_URL is set in Render
2. Check backend CORS configuration
3. Verify origin matches exactly
```

### **Issue: "MongoDB Connection Error"**
```
Cause: Invalid connection string or network access
Fix:
1. Verify MONGO_URI is correct
2. Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
3. Ensure database user has correct permissions
```

### **Issue: "401 Unauthorized" after login**
```
Cause: JWT token issues
Fix:
1. Ensure JWT_SECRET is set in backend
2. Check token expiry settings
3. Clear browser localStorage and cookies
```

## **Next Steps** 🚀

1. **Read**: [QUICK_FIX.md](./QUICK_FIX.md) for immediate steps
2. **Follow**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
3. **Deploy**: Backend on Render
4. **Configure**: Environment variables
5. **Test**: Login and all features
6. **Monitor**: Check logs and performance

---

**Need Help?** Check the logs:
- **Frontend**: Browser Console (F12)
- **Backend**: Render Dashboard → Logs
- **Database**: MongoDB Atlas → Metrics

---

**Good luck! 🎉**
