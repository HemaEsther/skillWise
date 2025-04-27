@echo off
echo Setting up Video Chat Application...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    echo You can download it from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit .env file with your LiveKit credentials
)

echo Setup completed!
echo.
echo To start the server, run:
echo npm start
echo.
echo To start in development mode, run:
echo npm run dev
echo.
pause 