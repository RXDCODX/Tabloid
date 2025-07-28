# Скрипт для диагностики проблем с frontend
param(
    [switch]$Verbose = $false
)

Write-Host "🔍 Диагностика проблем с frontend..." -ForegroundColor Green

# Проверяем наличие папки scoreboard-app
$scoreboardAppPath = "scoreboard-app"
if (-not (Test-Path $scoreboardAppPath)) {
    Write-Host "❌ Папка $scoreboardAppPath не найдена" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Папка $scoreboardAppPath найдена" -ForegroundColor Green

# Проверяем package.json
$packageJsonPath = "$scoreboardAppPath\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ package.json не найден в $scoreboardAppPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ package.json найден" -ForegroundColor Green

# Читаем package.json
try {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    Write-Host "📋 Версия приложения: $($packageJson.version)" -ForegroundColor Cyan
    Write-Host "📋 Имя приложения: $($packageJson.name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка при чтении package.json: $_" -ForegroundColor Red
    exit 1
}

# Проверяем Node.js
Write-Host "📋 Проверяем Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js не найден" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js версия: $nodeVersion" -ForegroundColor Green

# Проверяем npm
Write-Host "📋 Проверяем npm..." -ForegroundColor Cyan
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm не найден" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm версия: $npmVersion" -ForegroundColor Green

# Проверяем node_modules
$nodeModulesPath = "$scoreboardAppPath\node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "✅ node_modules найден" -ForegroundColor Green
    if ($Verbose) {
        $nodeModulesSize = (Get-ChildItem $nodeModulesPath -Recurse | Measure-Object -Property Length -Sum).Sum
        $nodeModulesSizeMB = [math]::Round($nodeModulesSize / 1MB, 2)
        Write-Host "📊 Размер node_modules: $nodeModulesSizeMB MB" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  node_modules не найден, нужно выполнить npm install" -ForegroundColor Yellow
}

# Проверяем dist папку
$distPath = "$scoreboardAppPath\dist"
if (Test-Path $distPath) {
    Write-Host "✅ dist папка найдена" -ForegroundColor Green
    
    # Показываем содержимое dist
    $distFiles = Get-ChildItem $distPath -Recurse -File
    Write-Host "📋 Файлы в dist:" -ForegroundColor Cyan
    foreach ($file in $distFiles) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + $distPath.Length + 2)
        $sizeKB = [math]::Round($file.Length / 1KB, 1)
        Write-Host "   📄 $relativePath ($sizeKB KB)" -ForegroundColor Yellow
    }
    
    # Проверяем index.html
    $indexHtmlPath = "$distPath\index.html"
    if (Test-Path $indexHtmlPath) {
        Write-Host "✅ index.html найден" -ForegroundColor Green
        if ($Verbose) {
            $indexContent = Get-Content $indexHtmlPath -Raw
            if ($indexContent -match "assets/index-[a-zA-Z0-9]+\.js") {
                $jsFile = $matches[0]
                Write-Host "📋 Найден JS файл: $jsFile" -ForegroundColor Cyan
                
                $jsFilePath = "$distPath\$jsFile"
                if (Test-Path $jsFilePath) {
                    Write-Host "✅ JS файл существует: $jsFilePath" -ForegroundColor Green
                } else {
                    Write-Host "❌ JS файл не найден: $jsFilePath" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "❌ index.html не найден в dist" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  dist папка не найдена, нужно выполнить npm run build" -ForegroundColor Yellow
}

# Проверяем vite.config.ts
$viteConfigPath = "$scoreboardAppPath\vite.config.ts"
if (Test-Path $viteConfigPath) {
    Write-Host "✅ vite.config.ts найден" -ForegroundColor Green
    if ($Verbose) {
        Write-Host "📋 Содержимое vite.config.ts:" -ForegroundColor Cyan
        Get-Content $viteConfigPath | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "⚠️  vite.config.ts не найден" -ForegroundColor Yellow
}

# Проверяем tsconfig.json
$tsConfigPath = "$scoreboardAppPath\tsconfig.json"
if (Test-Path $tsConfigPath) {
    Write-Host "✅ tsconfig.json найден" -ForegroundColor Green
} else {
    Write-Host "⚠️  tsconfig.json не найден" -ForegroundColor Yellow
}

Write-Host "🎉 Диагностика завершена!" -ForegroundColor Green

# Рекомендации
Write-Host "💡 Рекомендации:" -ForegroundColor Cyan
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "   📦 Выполните: cd scoreboard-app && npm install" -ForegroundColor Yellow
}
if (-not (Test-Path $distPath)) {
    Write-Host "   🔨 Выполните: cd scoreboard-app && npm run build" -ForegroundColor Yellow
}
if (-not (Test-Path "$distPath\index.html")) {
    Write-Host "   🔍 Проверьте настройки сборки в vite.config.ts" -ForegroundColor Yellow
} 