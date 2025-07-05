@echo off
setlocal enabledelayedexpansion

echo 🏏 Cricket Team Selection App - Docker Deployment
echo ==================================================

set "command=%~1"
if "%command%"=="" set "command=deploy"

goto %command% 2>nul || goto usage

:deploy
echo 🚀 Deploying production environment...
call :check_docker
call :cleanup
echo 🏗️  Building and starting services...
docker-compose up --build -d
if errorlevel 1 (
    echo ❌ Deployment failed
    exit /b 1
)

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🏥 Checking service health...
curl -f http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    docker-compose logs backend
    exit /b 1
)
echo ✅ Backend is healthy

curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend health check failed
    docker-compose logs frontend
    exit /b 1
)
echo ✅ Frontend is healthy

echo 🎉 Deployment successful!
echo.
echo 📱 Access your application:
echo    Frontend: http://localhost
echo    Backend:  http://localhost:3001
echo    Health:   http://localhost:3001/health
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop app:  docker-compose down
goto :eof

:dev
echo 🛠️  Starting development environment...
call :check_docker
docker-compose -f docker-compose.dev.yml up --build
goto :eof

:stop
echo 🛑 Stopping services...
docker-compose down
echo ✅ Services stopped
goto :eof

:clean
echo 🧹 Cleaning up everything...
docker-compose down -v --rmi all
echo ✅ Cleanup completed
goto :eof

:logs
docker-compose logs -f
goto :eof

:status
docker-compose ps
goto :eof

:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo ✅ Docker is running
goto :eof

:cleanup
echo 🧹 Cleaning up previous deployment...
docker-compose down -v >nul 2>&1
echo ✅ Cleanup completed
goto :eof

:usage
echo Usage: %~nx0 {deploy^|dev^|stop^|clean^|logs^|status}
echo.
echo Commands:
echo   deploy  - Deploy production environment (default)
echo   dev     - Start development environment
echo   stop    - Stop all services
echo   clean   - Remove all containers, images, and volumes
echo   logs    - View real-time logs
echo   status  - Show service status
exit /b 1
