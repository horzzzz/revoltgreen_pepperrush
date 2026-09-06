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
  menu/                         # фон, логотип, персонаж, пилюля и иконки (Figma 1:173)
  daily/                        # подарок для ежедневного бонуса (Figma 1:191)
  wheel/                        # сектора, обод, центр и указатель колеса (Figma 1:217)
  ui/                           # общее: плашка кнопки, стрелка «назад», крестик
src/
  app/                          # маршруты expo-router
  components/splash/            # экран загрузки (Figma 1:169)
  components/menu/              # меню (Figma 1:173)
  components/leaderboard/       # таблица лидеров (Figma 1:894)
  components/settings/          # настройки, модалка поверх меню (Figma 1:165)
  components/daily/             # ежедневный бонус (Figma 1:191)
  components/wheel/             # колесо фортуны (Figma 1:217 / 1:227)
  components/ui/app-text.tsx    # Text с GFS Neohellenic — единственный шрифт приложения
  constants/theme.ts            # токены из Figma
  game/player.ts                # состояние игрока — пока хардкод, тут будет экономика
  game/leaderboard.ts           # соперники и расчёт места по балансу
  game/wheel.ts                 # сектора колеса, углы остановки, кулдаун
  hooks/use-design-scale.ts     # перевод размеров из Figma (кадр 430pt) в points
```

Запуск: нативный сплеш (чёрный, без логотипа) → экран загрузки с прогресс-баром → меню.
Из меню пьедестал открывает таблицу лидеров, подарок — ежедневный бонус, шестерёнка —
настройки (модалка поверх меню), колесо — Wheel of Luck. Кнопка Play пока заглушка. Переключатели в настройках
живут в локальном стейте: сохранения ещё нет.

У компонента `bg` в Figma два варианта — на сплеше перец в центре есть, в меню нет, поэтому
`splash/bg.jpg` и `menu/bg.jpg` это разные картинки.

## Дизайн

Figma: [`sbKUEr6VroRxQcnrbBzqhm`](https://www.figma.com/design/sbKUEr6VroRxQcnrbBzqhm/Untitled).
