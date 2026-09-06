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
  menu/                         # фон, логотип, персонаж, кнопка, пилюля и иконки (Figma 1:173)
  ui/                           # общая мелочь: стрелка «назад»
src/
  app/                          # маршруты expo-router
  components/splash/            # экран загрузки (Figma 1:169)
  components/menu/              # меню (Figma 1:173)
  components/leaderboard/       # таблица лидеров (Figma 1:894)
  components/ui/app-text.tsx    # Text с GFS Neohellenic — единственный шрифт приложения
  constants/theme.ts            # токены из Figma
  game/player.ts                # состояние игрока — пока хардкод, тут будет экономика
  game/leaderboard.ts           # соперники и расчёт места по балансу
  hooks/use-design-scale.ts     # перевод размеров из Figma (кадр 430pt) в points
```

Запуск: нативный сплеш (чёрный, без логотипа) → экран загрузки с прогресс-баром → меню.
Из меню иконка с пьедесталом открывает таблицу лидеров; остальные кнопки пока заглушки —
нажимаются, но никуда не ведут.

У компонента `bg` в Figma два варианта — на сплеше перец в центре есть, в меню нет, поэтому
`splash/bg.jpg` и `menu/bg.jpg` это разные картинки.

## Дизайн

Figma: [`sbKUEr6VroRxQcnrbBzqhm`](https://www.figma.com/design/sbKUEr6VroRxQcnrbBzqhm/Untitled).
