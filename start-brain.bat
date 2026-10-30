@echo off
chcp 65001 >nul
title AI Second Brain — Live Server
echo ========================================================
echo   AI Second Brain — Live Server (PT / EN)
echo   Iniciando servidor dinamico / Starting dynamic server
echo ========================================================
echo.
node server.js %*
pause
