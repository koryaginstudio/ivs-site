@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Для запуска установите Node.js 20.9 или новее: https://nodejs.org/
  pause
  exit /b 1
)
call npm run local
if errorlevel 1 echo Не удалось запустить сайт. Проверьте сообщение выше.
pause
