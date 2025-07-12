# Скрипт для проверки статуса сборки
param(
    [string]$Version = "",
    [string]$Repository = ""
)

Write-Host "🔍 Проверяем статус сборки..." -ForegroundColor Green

# Если версия не указана, пытаемся получить последний тег
if (-not $Version) {
    $latestTag = git describe --tags --abbrev=0 2>$null
    if ($latestTag) {
        $Version = $latestTag.TrimStart('v')
        Write-Host "📋 Используем последний тег: $latestTag" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Не найден тег. Укажите версию: -Version 1.0.0" -ForegroundColor Red
        exit 1
    }
}

# Если репозиторий не указан, пытаемся получить из git
if (-not $Repository) {
    $remoteUrl = git config --get remote.origin.url
    if ($remoteUrl) {
        # Извлекаем имя репозитория из URL
        if ($remoteUrl -match "github\.com[:/]([^/]+/[^/]+?)(?:\.git)?$") {
            $Repository = $matches[1]
        }
    }
    
    if (-not $Repository) {
        Write-Host "❌ Не удалось определить репозиторий. Укажите: -Repository owner/repo" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📋 Репозиторий: $Repository" -ForegroundColor Cyan
Write-Host "📋 Версия: $Version" -ForegroundColor Cyan

# Проверяем, есть ли GitHub CLI
$ghVersion = gh --version 2>$null
if (-not $ghVersion) {
    Write-Host "❌ GitHub CLI не установлен. Установите: https://cli.github.com/" -ForegroundColor Red
    Write-Host "💡 Альтернативно, проверьте статус вручную:" -ForegroundColor Yellow
    Write-Host "   https://github.com/$Repository/actions" -ForegroundColor Yellow
    exit 1
}

# Проверяем аутентификацию
$authStatus = gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не авторизован в GitHub CLI. Выполните: gh auth login" -ForegroundColor Red
    exit 1
}

# Получаем информацию о релизе
Write-Host "📋 Получаем информацию о релизе..." -ForegroundColor Cyan
$release = gh api "repos/$Repository/releases/tags/v$Version" 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Релиз v$Version не найден" -ForegroundColor Red
    Write-Host "💡 Возможно, сборка еще не завершена" -ForegroundColor Yellow
    Write-Host "🔗 Проверьте статус: https://github.com/$Repository/actions" -ForegroundColor Yellow
    exit 1
}

# Парсим JSON ответ
$releaseData = $release | ConvertFrom-Json

Write-Host "✅ Релиз найден!" -ForegroundColor Green
Write-Host "📋 Название: $($releaseData.name)" -ForegroundColor Cyan
Write-Host "📋 Дата создания: $($releaseData.created_at)" -ForegroundColor Cyan
Write-Host "📋 Статус: $($releaseData.draft ? 'Черновик' : 'Опубликован')" -ForegroundColor Cyan

# Показываем прикрепленные файлы
if ($releaseData.assets) {
    Write-Host "📦 Прикрепленные файлы:" -ForegroundColor Cyan
    foreach ($asset in $releaseData.assets) {
        $sizeMB = [math]::Round($asset.size / 1MB, 2)
        Write-Host "   📄 $($asset.name) ($sizeMB MB)" -ForegroundColor Yellow
        Write-Host "      🔗 $($asset.browser_download_url)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Нет прикрепленных файлов" -ForegroundColor Yellow
}

# Проверяем статус последних workflow runs
Write-Host "🔄 Проверяем статус сборки..." -ForegroundColor Cyan
$workflows = gh api "repos/$Repository/actions/runs?head=refs/tags/v$Version" 2>$null

if ($LASTEXITCODE -eq 0) {
    $workflowData = $workflows | ConvertFrom-Json
    
    if ($workflowData.workflow_runs) {
        Write-Host "📋 Последние сборки:" -ForegroundColor Cyan
        foreach ($run in $workflowData.workflow_runs | Select-Object -First 5) {
            $status = switch ($run.status) {
                "completed" { "✅ Завершена" }
                "in_progress" { "🔄 Выполняется" }
                "queued" { "⏳ В очереди" }
                "waiting" { "⏳ Ожидает" }
                default { "❓ $($run.status)" }
            }
            
            $conclusion = switch ($run.conclusion) {
                "success" { "✅ Успешно" }
                "failure" { "❌ Ошибка" }
                "cancelled" { "🚫 Отменена" }
                "skipped" { "⏭️ Пропущена" }
                default { "❓ $($run.conclusion)" }
            }
            
            Write-Host "   📋 $($run.name) - $status - $conclusion" -ForegroundColor Yellow
            Write-Host "      🔗 $($run.html_url)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Сборки не найдены" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Не удалось получить информацию о сборках" -ForegroundColor Yellow
}

Write-Host "🔗 Ссылки:" -ForegroundColor Cyan
Write-Host "   📋 Релиз: $($releaseData.html_url)" -ForegroundColor Yellow
Write-Host "   🔄 Actions: https://github.com/$Repository/actions" -ForegroundColor Yellow
Write-Host "   📦 Releases: https://github.com/$Repository/releases" -ForegroundColor Yellow 