# Скрипт для создания portable версии приложения
param(
    [string]$Version = "1.0.0",
    [string]$PublishPath = "portable"
)

Write-Host "📦 Создаем portable версию приложения..." -ForegroundColor Green
Write-Host "Версия: $Version" -ForegroundColor Yellow

# Создаем директорию для portable версии
$portableDir = "portable-release"
if (Test-Path $portableDir) {
    Remove-Item $portableDir -Recurse -Force
}
New-Item -ItemType Directory -Path $portableDir | Out-Null

# Копируем все файлы из publish
Write-Host "📋 Копируем файлы..." -ForegroundColor Cyan
Copy-Item -Path "$PublishPath\*" -Destination $portableDir -Recurse -Force

# Создаем batch файл для запуска
$batchContent = @"
@echo off
echo Starting Scoreboard Application...
echo.
echo Version: $Version
echo.
start http://localhost:5000
dotnet scoreboard-backend.dll
pause
"@

$batchContent | Out-File -FilePath "$portableDir\start-scoreboard.bat" -Encoding ASCII

# Создаем README для portable версии
$readmeContent = @"
# Scoreboard Application - Portable Version

## Версия: $Version

## Установка и запуск

1. Убедитесь, что у вас установлен .NET 9.0 Runtime
2. Запустите файл `start-scoreboard.bat`
3. Приложение откроется в браузере по адресу http://localhost:5000

## Требования

- Windows 10/11
- .NET 9.0 Runtime
- Веб-браузер

## Структура файлов

- `scoreboard-backend.dll` - основное приложение
- `scoreboard-backend.exe` - исполняемый файл
- `wwwroot/` - веб-интерфейс
- `start-scoreboard.bat` - скрипт запуска

## Примечания

- Это portable версия, не требует установки
- Все настройки хранятся в appsettings.json
- Для остановки приложения закройте окно консоли
"@

$readmeContent | Out-File -FilePath "$portableDir\README.txt" -Encoding UTF8

# Создаем ZIP архив
$zipName = "Scoreboard-Portable-$Version.zip"
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
}

Write-Host "📦 Создаем ZIP архив..." -ForegroundColor Cyan
Compress-Archive -Path "$portableDir\*" -DestinationPath $zipName -Force

# Проверяем результат
if (Test-Path $zipName) {
    $fileSize = (Get-Item $zipName).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "✅ Portable версия создана: $zipName" -ForegroundColor Green
    Write-Host "📊 Размер файла: $fileSizeMB MB" -ForegroundColor Yellow
} else {
    Write-Host "❌ Ошибка при создании ZIP архива" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Portable версия готова!" -ForegroundColor Green
Write-Host "Файл: $zipName" -ForegroundColor Yellow 