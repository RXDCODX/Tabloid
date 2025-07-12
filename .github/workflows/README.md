# GitHub Workflows для сборки MSI инсталлеров

Этот репозиторий содержит GitHub Actions workflows для автоматической сборки MSI инсталлеров при создании тегов.

## Доступные Workflows

### 1. build-msi.yml
Базовый workflow для сборки MSI инсталлера с использованием существующего проекта Install.vdproj.

**Особенности:**
- Использует существующий MSI проект
- Собирает backend в Release конфигурации
- Автоматически собирает frontend (React) и копирует в wwwroot
- Требует Node.js 23+ для сборки frontend

### 2. build-msi-advanced.yml
Продвинутый workflow, который создает MSI инсталлер со всеми файлами из `dotnet publish`.

**Особенности:**
- Выполняет полный `dotnet publish`
- Динамически создает MSI проект, включающий все файлы из publish
- Более полный инсталлер со всеми зависимостями

### 3. build-msi-wix.yml
Современный workflow, использующий WiX Toolset для создания MSI инсталлера.

**Особенности:**
- Использует WiX Toolset (современный стандарт для MSI)
- Более гибкая настройка инсталлера
- Лучшая поддержка и документация
- Автоматическая установка WiX через Chocolatey

## Триггеры

Workflows запускаются при push тегов, начинающихся с `v*`:
- `v1.0.0`
- `v2.1.3`
- `v1.0.0-beta.1`

## Требования

- .NET 9.0
- Node.js 23+
- Windows runner (для сборки MSI)

## Процесс сборки

1. **Checkout кода** - клонирование репозитория
2. **Setup .NET 9.0** - установка .NET SDK
3. **Setup Node.js 23** - установка Node.js с кэшированием npm
4. **Restore dependencies** - восстановление .NET пакетов
5. **Build backend** - сборка scoreboard-backend
6. **Build frontend** - автоматическая сборка React приложения (через Target в .csproj)
7. **Build MSI** - создание MSI инсталлера
8. **Upload artifacts** - загрузка MSI файла как артефакт
9. **Create Release** - создание GitHub Release с MSI файлом

## Результат

После успешного выполнения workflow:
- MSI файл будет доступен в разделе Actions как артефакт
- Автоматически создастся GitHub Release с тегом
- MSI файл будет прикреплен к Release

## Использование

1. Создайте тег с версией:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Workflow автоматически запустится и создаст MSI инсталлер

3. Скачайте MSI файл из GitHub Release или Actions artifacts

## Структура проекта

```
Board/
├── scoreboard-backend/     # .NET 9.0 Web API
├── scoreboard-app/         # React frontend
├── Install/               # MSI installer project
└── .github/workflows/     # GitHub Actions workflows
```

## Примечания

- Frontend автоматически собирается при сборке backend благодаря Target в .csproj
- MSI инсталлер включает .NET Runtime 9.0 как prerequisite
- Все файлы из `dotnet publish` включаются в инсталлер
- Workflow использует Windows runner для совместимости с MSI сборкой 