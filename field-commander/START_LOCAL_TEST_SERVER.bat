@echo off
cd /d "%~dp0"
echo.
echo ELARA LOCAL TEST SERVER
echo =======================
echo.
echo Opening http://localhost:8080
echo Keep this window open while testing.
echo.
start "" http://localhost:8080
python -m http.server 8080
pause
