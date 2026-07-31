@echo off
cd /d "%~dp0"
echo =========================================
echo Starting Aegis Frontend Web Apps...
echo =========================================

start "Admin Portal" cmd /k "cd apps\admin-web && npm run dev"
start "Customer Portal" cmd /k "cd apps\customer-web && npm run dev"

echo.
echo Both frontends are booting up in separate windows!
echo Please check http://localhost:5173 (Customer) and http://localhost:5174 (Admin)
echo.
pause
