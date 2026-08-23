@echo off
REM Local Windows startup (default port 8001)
cd /d "%~dp0"
if "%PORT%"=="" set PORT=8001
uvicorn main:app --host 0.0.0.0 --port %PORT%
