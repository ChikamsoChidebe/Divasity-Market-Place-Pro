@echo off
echo Starting Divasity Platform Pro Frontend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env.local file exists
if not exist ".env.local" (
    echo Creating .env.local file...
    echo VITE_API_URL=http://localhost:3001/api/v1 > .env.local
    echo VITE_SOCKET_URL=http://localhost:3001 >> .env.local
    echo.
    echo Environment file created with default settings.
)

REM Start the development server
echo Starting development server...
echo.
echo Frontend will be available at: http://localhost:5173
echo.
echo Demo Accounts:
echo - Creator: creator@demo.com (any password)
echo - Investor: investor@demo.com (any password)  
echo - Admin: admin@demo.com (any password)
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev