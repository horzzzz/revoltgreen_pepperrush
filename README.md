# RevoltGreen PepperRush

Expo (SDK 57) приложение. Бандл: `com.revoltgreen.pepperrush`.

## Запуск

```bash
npm install
npm start
```

## Структура

```
assets/images/
  icon.png                      # иконка iOS (Figma 1:892)
  android-icon-foreground.png   # foreground adaptive icon (Figma 1:923)
  splash/
    blank.png                   # заглушка нативного сплеша (чёрное на чёрном)
    bg.jpg                      # фон экрана загрузки (Figma 1:170)
    hi.png                      # лого-надпись «HI! LET'S MAKE TODAY LUCKY!» (Figma 1:172)
src/
  app/                          # маршруты expo-router
  components/splash/            # экран загрузки (Figma 1:169)
  components/ui/app-text.tsx    # Text с GFS Neohellenic — единственный шрифт приложения
  constants/theme.ts            # токены из Figma
```

Запуск: нативный сплеш (чёрный, без логотипа) → экран загрузки с прогресс-баром → главный экран.

## Дизайн

Figma: [`sbKUEr6VroRxQcnrbBzqhm`](https://www.figma.com/design/sbKUEr6VroRxQcnrbBzqhm/Untitled).
