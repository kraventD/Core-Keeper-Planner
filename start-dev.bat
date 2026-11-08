@echo off
chcp 65001 >nul
title Core Keeper Planner - Dev Server
echo ========================================
echo  Core Keeper Planner
echo  Servidor de desarrollo en puerto 3000
echo ========================================
echo.
echo Abriendo http://localhost:3000/
echo.
cd /d "%~dp0"
npx vite --port 3000
pause
