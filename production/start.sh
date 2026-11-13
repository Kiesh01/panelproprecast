#!/usr/bin/env bash
# CastOps Launch Script for macOS and Linux
cd "$(dirname "$0")"

echo "=========================================================="
echo " Starting CastOps Production & Defect Monitoring System"
echo "=========================================================="

if command -v python3 &> /dev/null; then
    echo "Running with Python 3 on http://localhost:5050 ..."
    python3 server.py
elif command -v python &> /dev/null; then
    echo "Running with Python on http://localhost:5050 ..."
    python server.py
elif command -v npm &> /dev/null; then
    echo "Python not detected. Launching with Node.js / Vite on http://localhost:3000 ..."
    npm run dev
else
    echo "Error: Neither Python 3 nor Node.js found. Please install Python or Node."
    exit 1
fi
