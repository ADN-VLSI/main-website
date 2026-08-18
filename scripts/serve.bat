@echo off
setlocal

set PORT=%1
if "%PORT%"=="" set PORT=5500

cd /d "%~dp0\.."

echo ADN local server running
echo Public site: http://127.0.0.1:%PORT%/
echo Admin panel: http://127.0.0.1:%PORT%/admin/

python -m http.server %PORT% --bind 127.0.0.1
