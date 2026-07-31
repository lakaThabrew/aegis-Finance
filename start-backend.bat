@echo off
cd /d "%~dp0"
echo =========================================
echo Starting Aegis Backend Microservices...
echo =========================================

start "API Gateway" cmd /k "cd services\api-gateway && mvnw spring-boot:run"
start "Core Banking" cmd /k "cd services\core-banking && mvnw spring-boot:run"
start "Fraud Service" cmd /k "cd services\fraud-service && mvnw spring-boot:run"
start "Identity Service" cmd /k "cd services\identity-service && mvnw spring-boot:run"
start "Notification Service" cmd /k "cd services\notification-service && mvnw spring-boot:run"

echo.
echo All 5 backend services are booting up in separate windows!
echo Please wait a minute or two for them all to fully start.
echo.
pause
