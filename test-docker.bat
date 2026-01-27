@echo off
echo ========================================
echo   Testing Docker Build
echo ========================================
echo.

echo [1/2] Building Docker image...
docker build -t qms-erp-test .

if errorlevel 1 (
    echo.
    echo [ERROR] Docker build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting container...
echo.
echo Container will be available at: http://localhost:8000
echo Press Ctrl+C to stop the container
echo.

docker run -p 8000:8000 --name qms-erp-test-container qms-erp-test

echo.
echo Cleaning up...
docker rm qms-erp-test-container

pause
