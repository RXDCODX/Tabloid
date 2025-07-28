# Fighting Scoreboard - Система управления счетом

Веб-приложение для отображения и управления счетом в боях/соревнованиях с возможностью создания MSI инсталлеров.

## 🚀 Быстрый старт

### Требования
- .NET 9.0 SDK
- Node.js 23+
- Git

### Локальная разработка
```bash
# Клонирование репозитория
git clone <repository-url>
cd Board

# Восстановление зависимостей
dotnet restore
npm install --prefix scoreboard-app

# Запуск приложения
dotnet run --project scoreboard-backend
```

## ✨ Новые возможности

### 🎛️ Управление видимостью панели
- **VisibilityCard** - компактный компонент для включения/выключения панели скорборда
- **Анимация затухания** - плавная анимация при переключении состояния (500ms)
- **Необратимость процесса** - во время анимации процесс нельзя отменить
- **Синхронизация состояния** - состояние сохраняется на бекенде и синхронизируется между всеми клиентами
- **Визуальная обратная связь** - спиннер загрузки и изменение текста кнопки во время анимации

### 🎨 Улучшенный интерфейс
- **Компактный дизайн** - VisibilityCard и MetaPanel размещены в один ряд
- **Адаптивная сетка** - 2/10 колонок на десктопе, 3/9 на планшетах, полная ширина на мобильных
- **Вертикальное выравнивание** - все элементы MetaPanel расположены в столбик для экономии места
- **Цветовая схема** - красный для скрытия, зеленый для показа панели
- **Адаптивный дизайн** - корректное отображение на всех устройствах

## 📦 Автоматическая сборка

Проект настроен с GitHub Actions для автоматической сборки при создании тегов.

### Доступные workflows

1. **MSI Installer (Basic)** - `build-msi.yml`
   - Сборка MSI инсталлера с использованием существующего проекта
   - Требует: .NET 9.0, Node.js 23+

2. **MSI Installer (Advanced)** - `build-msi-advanced.yml`
   - Продвинутая сборка с полным `dotnet publish`
   - Включает все файлы из publish в инсталлер

3. **MSI Installer (WiX)** - `build-msi-wix.yml`
   - Современная сборка с использованием WiX Toolset
   - Более гибкая настройка и лучшая поддержка

4. **Portable Application** - `build-portable.yml`
   - Создание portable версии (ZIP архив)
   - Не требует установки, работает из любой папки

### Создание релиза

#### Автоматически (рекомендуется)
```powershell
# Создание и отправка тега
.\scripts\create-release.ps1 -Version "1.0.0" -Message "Initial release" -Push
```

#### Вручную
```bash
# Создание тега
git tag -a v1.0.0 -m "Release version 1.0.0"

# Отправка тега (запускает сборку)
git push origin v1.0.0
```

### Проверка статуса сборки
```powershell
# Проверка последнего релиза
.\scripts\check-build-status.ps1

# Проверка конкретной версии
.\scripts\check-build-status.ps1 -Version "1.0.0"
```

## 🛠️ Локальное тестирование

### Тестирование сборки MSI
```powershell
# Тестирование полного процесса сборки
.\scripts\test-workflow.ps1

# Тестирование с конкретной версией
.\scripts\test-workflow.ps1 -Version "1.0.0-test"
```

### Создание portable версии
```powershell
# Создание portable версии
.\scripts\create-portable.ps1 -Version "1.0.0"
```

## 📁 Структура проекта

```
Board/
├── scoreboard-backend/          # .NET 9.0 Web API
│   ├── Hubs/                   # SignalR хабы
│   │   └── ScoreboardHub.cs    # Хаб с поддержкой управления видимостью
│   ├── Models/                 # Модели данных
│   │   └── ScoreboardModels.cs # Модели с полем isVisible
│   ├── Services/               # Сервисы
│   │   └── ScoreboardStateService.cs # Сервис с сохранением состояния видимости
│   └── wwwroot/               # Статические файлы (автогенерируется)
├── scoreboard-app/             # React frontend
│   ├── src/
│   │   ├── AdminPanel/        # Панель администратора
│   │   │   ├── VisibilityCard.tsx # Компактный компонент управления видимостью
│   │   │   ├── AdminPanel.tsx # Основной компонент с адаптивной сеткой
│   │   │   └── useAdminState.ts # Хук с поддержкой состояния видимости
│   │   ├── Scoreboard/        # Отображение счета с поддержкой скрытия
│   │   ├── Players/           # Управление игроками
│   │   └── Meta/              # Мета-информация
│   └── dist/                  # Собранный frontend
├── Install/                   # MSI installer project
├── scripts/                   # PowerShell скрипты
│   ├── create-release.ps1     # Создание релиза
│   ├── check-build-status.ps1 # Проверка статуса
│   ├── test-workflow.ps1      # Тестирование сборки
│   └── create-portable.ps1    # Создание portable версии
└── .github/workflows/         # GitHub Actions
    ├── build-msi.yml          # Базовая сборка MSI
    ├── build-msi-advanced.yml # Продвинутая сборка MSI
    ├── build-msi-wix.yml      # WiX сборка MSI
    └── build-portable.yml     # Сборка portable версии
```

## 🔧 Конфигурация

### Backend (.NET)
- Порт по умолчанию: 5000
- SignalR для real-time обновлений
- Автоматическая сборка frontend при сборке backend
- **Новое**: Сохранение состояния видимости в config.ini

### Frontend (React)
- TypeScript
- SignalR для подключения к backend
- Модульная архитектура с компонентами
- **Новое**: Компактный VisibilityCard с адаптивной сеткой

### MSI Installer
- Включает .NET 9.0 Runtime как prerequisite
- Устанавливает в Program Files
- Создает ярлыки в меню Пуск и на рабочем столе

## 📋 Результаты сборки

После успешного выполнения workflow:

1. **MSI файлы** - доступны в GitHub Releases
2. **Portable ZIP** - архив с приложением
3. **Артефакты** - доступны в Actions для скачивания
4. **Автоматические релизы** - создаются с тегами

## 🐛 Устранение неполадок

### Проблемы с Node.js
```bash
# Проверка версии
node --version  # Должна быть 23+

# Переустановка зависимостей
rm -rf scoreboard-app/node_modules
npm install --prefix scoreboard-app
```

### Проблемы с .NET
```bash
# Проверка версии
dotnet --version  # Должна быть 9.0+

# Очистка и восстановление
dotnet clean
dotnet restore
```

### Проблемы с MSI сборкой
```powershell
# Тестирование локально
.\scripts\test-workflow.ps1

# Диагностика проблем с frontend
.\scripts\debug-frontend.ps1

# Подробная диагностика
.\scripts\debug-frontend.ps1 -Verbose

# Очистка и пересборка frontend
.\scripts\clean-and-rebuild-frontend.ps1

# Принудительная очистка (включая node_modules)
.\scripts\clean-and-rebuild-frontend.ps1 -Force

# Проверка путей в Install.vdproj
# Убедитесь, что пути указывают на Release конфигурацию
```

## 📞 Поддержка

- **Issues**: Создавайте issues в GitHub для багов и предложений
- **Discussions**: Используйте Discussions для вопросов
- **Wiki**: Дополнительная документация в Wiki

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл LICENSE для подробностей. 