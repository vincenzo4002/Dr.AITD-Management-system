@echo off
echo ===================================================
echo      Dr AITD Management System - Launcher
echo ===================================================
echo.
echo [INFO] Applying recent fixes and updates...
echo.

echo [Step 1] Stopping any running servers (node.exe)...
taskkill /F /IM node.exe 2>nul
echo Done.

echo.
echo [Step 2] Starting Backend Server...
echo        - Listening on Port 4000
echo        - CORS enabled for Vercel & Localhost
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 5 /nobreak >nul

echo.
echo [Step 3] Starting Frontend Server...
echo        - Listening on Port 5173
start "Frontend Application" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo SUCCESS! Servers are running.
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173 (Your Local App)
echo.
echo NOTE: To fix the "Network Error" on Vercel, you MUST
echo       deploy this backend to the cloud (Render/Railway).
echo       See README.md for instructions.
echo ===================================================
echo.
pause