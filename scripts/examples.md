# Примеры использования скриптов

## 🚀 Создание релиза

### Простой релиз
```powershell
# Создание тега v1.0.0
.\scripts\create-release.ps1 -Version "1.0.0"
```

### Релиз с описанием
```powershell
# Создание тега с описанием
.\scripts\create-release.ps1 -Version "1.0.0" -Message "Добавлена поддержка новых функций"
```

### Релиз с автоматической отправкой
```powershell
# Создание и отправка тега (запускает сборку)
.\scripts\create-release.ps1 -Version "1.0.0" -Message "Initial release" -Push
```

## 🔍 Проверка статуса

### Проверка последнего релиза
```powershell
# Автоматически определяет последний тег
.\scripts\check-build-status.ps1
```

### Проверка конкретной версии
```powershell
# Проверка версии 1.0.0
.\scripts\check-build-status.ps1 -Version "1.0.0"
```

### Проверка с указанием репозитория
```powershell
# Явное указание репозитория
.\scripts\check-build-status.ps1 -Version "1.0.0" -Repository "username/repo"
```

## 🧪 Тестирование

### Тестирование сборки
```powershell
# Тестирование с версией по умолчанию
.\scripts\test-workflow.ps1
```

### Тестирование с конкретной версией
```powershell
# Тестирование версии 1.0.0-test
.\scripts\test-workflow.ps1 -Version "1.0.0-test"
```

## 📦 Создание portable версии

### Создание portable версии
```powershell
# Создание portable версии 1.0.0
.\scripts\create-portable.ps1 -Version "1.0.0"
```

### Создание из другой папки
```powershell
# Создание из папки publish
.\scripts\create-portable.ps1 -Version "1.0.0" -PublishPath "publish"
```

## 🔄 Полный цикл релиза

### 1. Подготовка
```powershell
# Убедитесь, что все изменения закоммичены
git status

# Если есть изменения, закоммитьте их
git add .
git commit -m "Prepare for release 1.0.0"
```

### 2. Создание релиза
```powershell
# Создание и отправка тега
.\scripts\create-release.ps1 -Version "1.0.0" -Message "Release 1.0.0" -Push
```

### 3. Мониторинг сборки
```powershell
# Проверка статуса каждые несколько минут
.\scripts\check-build-status.ps1 -Version "1.0.0"
```

### 4. Скачивание результатов
После успешной сборки:
- MSI файлы будут в GitHub Releases
- Portable ZIP будет в артефактах Actions
- Все файлы будут прикреплены к релизу

## 🐛 Устранение проблем

### Проблема: Тег уже существует
```powershell
# Удаление существующего тега
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Создание нового тега
.\scripts\create-release.ps1 -Version "1.0.0" -Push
```

### Проблема: Сборка не запускается
```powershell
# Проверка, что тег отправлен
git ls-remote --tags origin

# Принудительная отправка тега
git push origin v1.0.0 --force
```

### Проблема: GitHub CLI не установлен
```powershell
# Установка через winget
winget install GitHub.cli

# Или через Chocolatey
choco install gh
```

## 📋 Полезные команды

### Просмотр всех тегов
```bash
git tag -l
```

### Просмотр информации о теге
```bash
git show v1.0.0
```

### Удаление тега
```bash
# Локально
git tag -d v1.0.0

# В удаленном репозитории
git push origin :refs/tags/v1.0.0
```

### Просмотр истории коммитов
```bash
git log --oneline --graph
```

## 🔧 Настройка окружения

### Установка GitHub CLI
```powershell
# Установка
winget install GitHub.cli

# Авторизация
gh auth login
```

### Настройка Git
```bash
# Настройка пользователя
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Настройка редактора
git config --global core.editor "code --wait"
```

### Проверка версий
```powershell
# Проверка .NET
dotnet --version  # Должна быть 9.0+

# Проверка Node.js
node --version    # Должна быть 23+

# Проверка Git
git --version

# Проверка GitHub CLI
gh --version
``` 