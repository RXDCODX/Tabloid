# AdminPanel Components

Рефакторинг компонентов AdminPanel с разделением по папкам и выделением стилей в отдельные SCSS модули.

## Структура папок

```text
AdminPanel/
├── UI/                          # UI компоненты
│   ├── ActionButtons.tsx
│   └── ActionButtons.module.scss
├── Forms/                       # Формы и инпуты
│   ├── ColorPickerWithTransparency.tsx
│   ├── ColorPickerWithTransparency.module.scss
│   ├── FlagSelector.tsx
│   └── FlagSelector.module.scss
├── Cards/                       # Карточки и панели
│   ├── ColorPresetCard.tsx
│   ├── ColorPresetCard.module.scss
│   ├── MetaPanel.tsx
│   ├── MetaPanel.module.scss
│   ├── PlayerCard.tsx
│   ├── PlayerCard.module.scss
│   ├── VisibilityCard.tsx
│   └── VisibilityCard.module.scss
├── Utils/                       # Утилиты
│   └── flagUtils.ts
├── services/                    # Сервисы
│   └── PlayerPresetService.ts
├── types.ts                     # Типы
├── AdminPanel.tsx              # Главный компонент
├── AdminPanel.module.scss      # Главные стили
└── index.ts                    # Экспорты
```

## Принципы организации

### 1. Разделение по функциональности

- **UI/** - простые UI компоненты (кнопки, инпуты)
- **Forms/** - сложные формы и селекторы
- **Cards/** - карточки и панели с контентом
- **Utils/** - утилиты и хелперы

### 2. SCSS модули

Каждый компонент имеет свой SCSS модуль с:

- Локальными стилями компонента
- CSS переменными для динамических значений
- Responsive дизайном
- Семантическими именами классов

### 3. Импорты

Все компоненты экспортируются через `index.ts` для удобного импорта:

```typescript
import { AdminPanel, ActionButtons } from '../components/AdminPanel';
```

## Стили

### CSS переменные

Используются для динамических значений:

```scss
.presetButton {
  border-color: var(--preset-color);
  color: var(--preset-color);
}
```

### Responsive дизайн

```scss
@media (min-width: 768px) {
  .actionButtons {
    width: auto;
  }
}
```

### Состояния

```scss
.visibilityButton {
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

## Преимущества рефакторинга

1. **Лучшая организация** - компоненты сгруппированы по функциональности
2. **Изолированные стили** - каждый компонент имеет свои стили
3. **Переиспользование** - компоненты легко импортировать и использовать
4. **Масштабируемость** - легко добавлять новые компоненты
5. **Поддержка** - проще находить и изменять код
