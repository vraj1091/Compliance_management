@echo off
echo ========================================
echo   QMS-ERP Application Startup
echo ========================================
echo.

echo [1/3] Setting up database...
cd backend
python fix_database.py
if errorlevel 1 (
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
start "QMS Backend" cmd /k "python main.py"
timeout /t 3 /nobreak > nul

echo.
echo [3/3] Starting frontend...
cd ..\frontend
start "QMS Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Login Credentials:
echo   Username: admin
echo   Password: Admin@123
echo.
echo Press any key to open the application...
pause > nul

start http://localhost:5173

echo.
echo To stop the application, close both terminal windows.
echo.
pause
