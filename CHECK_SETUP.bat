@echo off
echo ========================================
echo   QMS-ERP Setup Verification
echo ========================================
echo.

set ERROR_COUNT=0

echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not found! Please install Python 3.9 or higher.
    set /a ERROR_COUNT+=1
) else (
    python --version
    echo [OK] Python is installed
)
echo.

echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js not found! Please install Node.js 16 or higher.
    set /a ERROR_COUNT+=1
) else (
    node --version
    echo [OK] Node.js is installed
)
echo.

echo [3/6] Checking backend dependencies...
if exist "backend\requirements.txt" (
    echo [OK] requirements.txt found
    cd backend
    pip show fastapi >nul 2>&1
    if errorlevel 1 (
        echo [!] Backend dependencies not installed
        echo     Run: pip install -r requirements.txt
        set /a ERROR_COUNT+=1
    ) else (
        echo [OK] Backend dependencies installed
    )
    cd ..
) else (
    echo [X] requirements.txt not found!
    set /a ERROR_COUNT+=1
)
echo.

echo [4/6] Checking frontend dependencies...
if exist "frontend\package.json" (
    echo [OK] package.json found
    if exist "frontend\node_modules" (
        echo [OK] Frontend dependencies installed
    ) else (
        echo [!] Frontend dependencies not installed
        echo     Run: cd frontend ^&^& npm install
        set /a ERROR_COUNT+=1
    )
) else (
    echo [X] package.json not found!
    set /a ERROR_COUNT+=1
)
echo.

echo [5/6] Checking database...
if exist "backend\qms_erp.db" (
    echo [OK] Database file exists
) else (
    echo [!] Database not initialized
    echo     Run: cd backend ^&^& python fix_database.py
    set /a ERROR_COUNT+=1
)
echo.

echo [6/6] Checking project structure...
if exist "backend\main.py" (
    echo [OK] Backend main.py found
) else (
    echo [X] Backend main.py not found!
    set /a ERROR_COUNT+=1
)

if exist "frontend\src\main.tsx" (
    echo [OK] Frontend main.tsx found
) else (
    echo [X] Frontend main.tsx not found!
    set /a ERROR_COUNT+=1
)
echo.

echo ========================================
echo   Verification Complete
echo ========================================
echo.

if %ERROR_COUNT%==0 (
    echo [SUCCESS] All checks passed! You're ready to start.
    echo.
    echo To start the application:
    echo   1. Double-click START_APP.bat
    echo   OR
    echo   2. Follow manual steps in QUICK_START_GUIDE.md
) else (
    echo [WARNING] %ERROR_COUNT% issue(s) found. Please fix them before starting.
    echo.
    echo See QUICK_START_GUIDE.md for detailed instructions.
)

echo.
pause
