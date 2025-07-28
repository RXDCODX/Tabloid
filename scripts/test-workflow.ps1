# Скрипт для тестирования сборки MSI инсталлера локально
# Имитирует процесс GitHub Actions workflow

param(
    [string]$Version = "1.0.0-test"
)

Write-Host "🚀 Начинаем тестирование сборки MSI инсталлера..." -ForegroundColor Green
Write-Host "Версия: $Version" -ForegroundColor Yellow

# Проверяем наличие .NET 9.0
Write-Host "📋 Проверяем .NET 9.0..." -ForegroundColor Cyan
$dotnetVersion = dotnet --version
if ($dotnetVersion -notlike "9.*") {
    Write-Host "❌ Требуется .NET 9.0, найдена версия: $dotnetVersion" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .NET версия: $dotnetVersion" -ForegroundColor Green

# Проверяем наличие Node.js
Write-Host "📋 Проверяем Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version
if ($nodeVersion -notlike "v23.*" -and $nodeVersion -notlike "v24.*") {
    Write-Host "❌ Требуется Node.js 23+, найдена версия: $nodeVersion" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js версия: $nodeVersion" -ForegroundColor Green

# Восстанавливаем зависимости
Write-Host "📦 Восстанавливаем .NET зависимости..." -ForegroundColor Cyan
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при восстановлении зависимостей" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Зависимости восстановлены" -ForegroundColor Green

# Собираем frontend сначала
Write-Host "🔨 Собираем frontend..." -ForegroundColor Cyan
Set-Location scoreboard-app

# Очищаем dist папку перед сборкой
if (Test-Path "dist") {
    Write-Host "🗑️  Очищаем dist папку..." -ForegroundColor Cyan
    Remove-Item "dist" -Recurse -Force
}

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при установке npm зависимостей" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend собран" -ForegroundColor Green

# Собираем backend в Release
Write-Host "🔨 Собираем scoreboard-backend в Release..." -ForegroundColor Cyan
dotnet build scoreboard-backend/scoreboard-backend.csproj -c Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend собран" -ForegroundColor Green

# Проверяем, что MSI проект существует
if (-not (Test-Path "Install/Install.vdproj")) {
    Write-Host "❌ MSI проект не найден: Install/Install.vdproj" -ForegroundColor Red
    exit 1
}

# Собираем MSI инсталлер
Write-Host "📦 Собираем MSI инсталлер..." -ForegroundColor Cyan
msbuild Install/Install.vdproj /p:Configuration=Release /p:Platform="Any CPU" /p:DeployOnBuild=true
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке MSI" -ForegroundColor Red
    exit 1
}

# Проверяем, что MSI файл создан
$msiPath = "Install/Release/Install.msi"
if (Test-Path $msiPath) {
    $fileSize = (Get-Item $msiPath).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "✅ MSI инсталлер создан: $msiPath" -ForegroundColor Green
    Write-Host "📊 Размер файла: $fileSizeMB MB" -ForegroundColor Yellow
} else {
    Write-Host "❌ MSI файл не найден: $msiPath" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Тестирование завершено успешно!" -ForegroundColor Green
Write-Host "MSI файл: $msiPath" -ForegroundColor Yellow 