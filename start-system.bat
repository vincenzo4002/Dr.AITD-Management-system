@echo off
echo ========================================
echo    Dr AITD Management System Startup
echo ========================================
echo.

echo Checking if MongoDB is running...
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting MongoDB service...
    net start MongoDB
) else (
    echo MongoDB is already running.
)

echo.
echo Killing any existing processes on port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Development Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo    System Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Default Login Credentials:
echo Admin: admin / admin123
echo Teacher: teacher / teacher123
echo Student: STU2025 / student123
echo.
echo Press any key to exit...
pause >nul