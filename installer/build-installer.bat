@echo off
setlocal

set ROOT=%~dp0..
set CONFIG=Release

where dotnet >nul 2>nul
if errorlevel 1 (
  echo dotnet SDK not found in PATH.
  exit /b 1
)

echo Publishing backend...
dotnet publish "%ROOT%\scoreboard-backend\scoreboard-backend.csproj" -c %CONFIG%
if errorlevel 1 exit /b 1

echo Building MSI...
dotnet build "%~dp0scoreboard-backend.wixproj" -c %CONFIG%
if errorlevel 1 exit /b 1

echo Done. MSI is in %~dp0bin\%CONFIG%.
