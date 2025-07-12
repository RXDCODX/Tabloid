# Скрипт для создания релиза
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    [string]$Message = "",
    [switch]$Push = $false
)

Write-Host "🚀 Создаем релиз версии $Version" -ForegroundColor Green

# Проверяем, что мы в git репозитории
if (-not (Test-Path ".git")) {
    Write-Host "❌ Это не git репозиторий" -ForegroundColor Red
    exit 1
}

# Проверяем, что нет незакоммиченных изменений
$status = git status --porcelain
if ($status) {
    Write-Host "❌ Есть незакоммиченные изменения:" -ForegroundColor Red
    Write-Host $status -ForegroundColor Yellow
    Write-Host "Сначала закоммитьте изменения" -ForegroundColor Red
    exit 1
}

# Проверяем, что тег не существует
$existingTag = git tag -l "v$Version"
if ($existingTag) {
    Write-Host "❌ Тег v$Version уже существует" -ForegroundColor Red
    exit 1
}

# Создаем тег
Write-Host "📋 Создаем тег v$Version..." -ForegroundColor Cyan
if ($Message) {
    git tag -a "v$Version" -m "$Message"
} else {
    git tag -a "v$Version" -m "Release version $Version"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при создании тега" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Тег v$Version создан" -ForegroundColor Green

# Показываем информацию о теге
Write-Host "📋 Информация о теге:" -ForegroundColor Cyan
git show "v$Version" --stat

if ($Push) {
    Write-Host "📤 Отправляем тег в удаленный репозиторий..." -ForegroundColor Cyan
    git push origin "v$Version"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при отправке тега" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Тег отправлен в удаленный репозиторий" -ForegroundColor Green
    Write-Host "🔄 GitHub Actions автоматически запустит сборку" -ForegroundColor Yellow
} else {
    Write-Host "💡 Для отправки тега выполните: git push origin v$Version" -ForegroundColor Yellow
}

Write-Host "🎉 Релиз v$Version готов!" -ForegroundColor Green 