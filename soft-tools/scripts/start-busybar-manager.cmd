@echo off
rem Start busybar-manager with the right Python. Double-click this file, or run
rem it from any terminal, VS Code's included.
rem
rem The manager finds Python through BUSYBAR_PYTHON. A terminal opened before
rem that setting was saved doesn't have it, and then every app crashes with
rem "Python was not found". This reads the saved setting straight from your
rem Windows user settings, so it works no matter where it's started from.
rem
rem This window is the manager. Ctrl+C in it stops the manager.
title BUSY Bar manager
for /f "tokens=2,*" %%A in ('reg query HKCU\Environment /v BUSYBAR_PYTHON 2^>nul ^| find "BUSYBAR_PYTHON"') do set "BUSYBAR_PYTHON=%%B"
if not defined BUSYBAR_PYTHON (
  echo BUSYBAR_PYTHON is not set, so no app could start.
  echo See hard-tools\busy-bar\running-the-manager.md, setup step 5.
  pause
  exit /b 1
)
cd /d D:\guest-repos\busybar-manager
echo Apps will run with: %BUSYBAR_PYTHON%
echo Dashboard: http://127.0.0.1:8321    Stop: Ctrl+C in this window
echo.
node server.js
echo.
echo The manager has stopped.
pause
