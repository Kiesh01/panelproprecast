@echo off
REM CastOps Launch Script for Windows (Visual Studio / Command Prompt)
cd /d "%~dp0"

echo ==========================================================
echo  Starting CastOps Production ^& Defect Monitoring System
echo ==========================================================

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching Python Flask server on http://localhost:5050 ...
    python server.py
    pause
    exit /b
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching Python Flask server on http://localhost:5050 ...
    py server.py
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching Node.js full-stack server on http://localhost:3000 ...
    npm run dev
    pause
    exit /b
)

echo Error: Neither Python nor Node.js detected on PATH.
pause
