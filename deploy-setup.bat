@echo off
REM Quick Deployment Setup Script for Windows
REM This script helps you commit and push the deployment configuration changes

echo.
echo ========================================
echo Dr. AITD Management System - Deployment Setup
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Error: Not a git repository. Please initialize git first.
    exit /b 1
)

echo Adding deployment configuration files...
git add netlify.toml
git add DEPLOYMENT_GUIDE.md
git add backend/index.js
git add backend/.env.example

echo Files staged for commit
echo.

echo Committing changes...
git commit -m "feat: Add deployment configuration for Netlify and Render - Added netlify.toml for proper frontend deployment settings - Created comprehensive DEPLOYMENT_GUIDE.md with step-by-step instructions - Updated backend CORS to support FRONTEND_URL environment variable - Updated .env.example with FRONTEND_URL documentation - Fixed login issue by documenting environment variable setup"

echo Changes committed
echo.

echo Pushing to GitHub...
git push origin main

echo.
echo Deployment configuration pushed to GitHub!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Follow the DEPLOYMENT_GUIDE.md to deploy your backend on Render
echo 2. Set the VITE_API_URL environment variable in Netlify
echo 3. Redeploy your Netlify site
echo.
echo Good luck with your deployment!
echo.
pause
