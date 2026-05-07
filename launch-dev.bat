@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting Ghost Engineer at http://127.0.0.1:3000
start "" "http://127.0.0.1:3000"
call npm run dev -- --hostname 127.0.0.1 --port 3000

endlocal
