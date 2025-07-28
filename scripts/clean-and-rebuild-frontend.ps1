# Скрипт для очистки и пересборки frontend
param(
    [switch]$Force = $false
)

Write-Host "🧹 Очистка и пересборка frontend..." -ForegroundColor Green

# Проверяем наличие папки scoreboard-app
$scoreboardAppPath = "scoreboard-app"
if (-not (Test-Path $scoreboardAppPath)) {
    Write-Host "❌ Папка $scoreboardAppPath не найдена" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Папка $scoreboardAppPath найдена" -ForegroundColor Green

# Переходим в папку scoreboard-app
Set-Location $scoreboardAppPath

# Очищаем node_modules если принудительно
if ($Force) {
    Write-Host "🗑️  Очищаем node_modules..." -ForegroundColor Cyan
    if (Test-Path "node_modules") {
        Remove-Item "node_modules" -Recurse -Force
        Write-Host "✅ node_modules удален" -ForegroundColor Green
    }
}

# Очищаем dist папку
Write-Host "🗑️  Очищаем dist папку..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Host "✅ dist папка удалена" -ForegroundColor Green
}

# Очищаем кэш npm
Write-Host "🗑️  Очищаем кэш npm..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "✅ Кэш npm очищен" -ForegroundColor Green

# Устанавливаем зависимости
Write-Host "📦 Устанавливаем зависимости..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при установке зависимостей" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Зависимости установлены" -ForegroundColor Green

# Собираем проект
Write-Host "🔨 Собираем проект..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке проекта" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Проект собран" -ForegroundColor Green

# Проверяем результат
Write-Host "📋 Проверяем результат сборки..." -ForegroundColor Cyan
if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Recurse -File
    Write-Host "📋 Файлы в dist:" -ForegroundColor Cyan
    foreach ($file in $distFiles) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 6) # +6 для "dist\"
        $sizeKB = [math]::Round($file.Length / 1KB, 1)
        Write-Host "   📄 $relativePath ($sizeKB KB)" -ForegroundColor Yellow
    }
    
    # Проверяем index.html
    if (Test-Path "dist\index.html") {
        Write-Host "✅ index.html создан" -ForegroundColor Green
        
        # Проверяем, что ссылки в index.html корректны
        $indexContent = Get-Content "dist\index.html" -Raw
        if ($indexContent -match "assets/index-[a-zA-Z0-9]+\.js") {
            $jsFile = $matches[0]
            Write-Host "📋 JS файл в index.html: $jsFile" -ForegroundColor Cyan
            
            $jsFilePath = "dist\$jsFile"
            if (Test-Path $jsFilePath) {
                Write-Host "✅ JS файл существует: $jsFilePath" -ForegroundColor Green
            } else {
                Write-Host "❌ JS файл не найден: $jsFilePath" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ index.html не создан" -ForegroundColor Red
    }
} else {
    Write-Host "❌ dist папка не создана" -ForegroundColor Red
}

# Возвращаемся в корневую папку
Set-Location ..

Write-Host "🎉 Очистка и пересборка завершена!" -ForegroundColor Green 