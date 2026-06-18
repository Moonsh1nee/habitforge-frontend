# HabitForge

**HabitForge** — персональная система трекинга привычек, задач и здоровья. Объединяет в одном интерфейсе управление задачами, отслеживание привычек, тренировки, питание, финансы и ежедневный дневник.

---

## Что умеет

| Модуль | Возможности |
|---|---|
| **Дашборд** | Daily Score (кольцо прогресса дня), быстрые метрики, TodayCard, прогресс привычек, статистика недели, макро-бар, превью дневника |
| **Задачи** | Создание / редактирование / удаление, приоритеты, дедлайны, подзадачи, проекты, теги, повторяющиеся задачи (ежедневно / еженедельно / ежемесячно), фильтры по статусу / приоритету / тегу / проекту, drag-and-drop сортировка |
| **Привычки** | Ежедневная отметка, стрики, streak freeze (заморозка стрика), calendar heatmap за 52 недели, сводка прогресса за сегодня |
| **Тренировки** | Логирование тренировок, шаблоны-планы с упражнениями |
| **Питание** | КБЖУ за день (donut-диаграмма), лог приёмов пищи по типам (завтрак / обед / ужин / перекус) |
| **Финансы** | Баланс, доходы/расходы за период, список транзакций с категориями и фильтрами, цветовая маркировка income/expense |
| **Дневник** | Слайдеры настроения (с emoji-индикатором) / энергии / стресса / сна, вес, заметки, серия дней подряд, динамика за 30 дней |
| **Аналитика** | Графики настроения и энергии, история тренировок, стрики привычек — с фильтрами за 7 / 30 / 90 дней |
| **Календарь** | Месячный / недельный / дневной вид задач, переход в day-вид по "+N ещё", быстрое создание задач |
| **Pomodoro** | Таймер в сайдбаре (focus / short break / long break), выбор задачи, счётчик сессий, toast-уведомления |
| **Глобальный поиск** | `Ctrl/⌘ K` — поиск по задачам, привычкам, записям дневника, транзакциям |
| **Профиль** | Редактирование данных, смена пароля, аватар, привязка Telegram-бота, Web Push уведомления |

---

## Стек

### Frontend (этот репозиторий)

- **[Next.js 16](https://nextjs.org/)** — App Router, React Server Components
- **[React 19](https://react.dev/)** — UI runtime
- **[TypeScript](https://www.typescriptlang.org/)** — строгая типизация
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first конфиг через `@theme {}` в `globals.css`
- **[shadcn/ui v4](https://ui.shadcn.com/)** — базовые UI-компоненты
- **[Motion for React v12](https://motion.dev/)** — анимации (glassmorphism, stagger, page transitions, SVG rings)
- **[TanStack Query v5](https://tanstack.com/query)** — серверное состояние и кэш
- **[Zustand v5](https://zustand-demo.pmnd.rs/)** — клиентское состояние (auth токены)
- **[React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/)** — формы и валидация
- **[Recharts v3](https://recharts.org/)** — графики (area, pie, bar, line)
- **[Axios](https://axios-http.com/)** — HTTP-клиент с автоматическим refresh токенов
- **[Sonner](https://sonner.emilkowal.ski/)** — toast-уведомления
- **[date-fns v4](https://date-fns.org/)** — работа с датами
- **[react-activity-calendar](https://grubersjoe.github.io/react-activity-calendar/)** — heatmap привычек
- **[@dnd-kit](https://dndkit.com/)** — drag-and-drop в календаре

### Backend (отдельный репозиторий)

- **FastAPI** + **SQLModel** + **PostgreSQL** + **Redis**
- Async SQLAlchemy 2.x + asyncpg
- JWT-аутентификация с HttpOnly cookies и refresh-токенами
- WebSocket для real-time обновлений
- Telegram-бот на aiogram 3.x
- Alembic-миграции

---

## Дизайн

Тёмная тема с glassmorphism-эстетикой:

- Фон: `#0a0a0f` (очень тёмный синевато-чёрный)
- Карточки: `.glass` — `rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)` + `border-radius: 16px`
- Акцент: `#7c3aed` (violet-primary) и `#06b6d4` (cyan-accent)
- Дополнительно: `.glass-elevated`, `.gradient-primary`, `.gradient-fire`, `.gradient-success`
- Все анимации через Motion for React — плавные переходы страниц, hover-эффекты на карточках, stagger-списки, анимированные SVG-кольца

---

## Быстрый старт

### Требования

- Node.js 20+
- npm 10+
- Запущенный бэкенд HabitForge на `http://localhost:8000`

### Установка

```bash
git clone <repo-url>
cd habitforge-frontend
npm install
```

### Переменные окружения

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Запуск

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # production server
```

Приложение автоматически перенаправит на `/login` при первом посещении.

---

## Структура проекта

```
habitforge-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                   ← страницы входа и регистрации
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/                    ← защищённые страницы приложения
│   │   │   ├── layout.tsx            ← Sidebar + Topbar + PageTransition + QuickAddFab
│   │   │   ├── dashboard/            ← DailyScore, QuickMetrics, TodayCard, WeeklyStats
│   │   │   ├── tasks/                ← список задач с фильтрами, TaskForm с повторением
│   │   │   ├── habits/               ← трекер привычек, heatmap, прогресс за сегодня
│   │   │   ├── workouts/             ← тренировки и планы
│   │   │   ├── nutrition/            ← КБЖУ, лог питания
│   │   │   ├── finance/              ← транзакции, баланс, категории
│   │   │   ├── journal/              ← дневник с mood emoji, стриком, chart 30 дней
│   │   │   ├── stats/                ← аналитика: графики, стрики привычек
│   │   │   ├── calendar/             ← месячный/недельный вид задач
│   │   │   └── profile/              ← профиль, аватар, пароль, Telegram
│   │   ├── layout.tsx                ← корневой layout: шрифты, Providers
│   │   ├── globals.css               ← дизайн-система: @theme {}, .glass, анимации
│   │   └── Providers.tsx             ← QueryClient + Toaster
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui компоненты (не редактировать вручную)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           ← навигация, TodayProgress, бейдж просроченных задач
│   │   │   ├── Topbar.tsx            ← GlobalSearch, аватар пользователя
│   │   │   ├── PageTransition.tsx    ← entrance-анимация при смене маршрута
│   │   │   ├── QuickAddFab.tsx       ← плавающая кнопка быстрого создания (5 действий)
│   │   │   └── GlobalSearch.tsx      ← Ctrl/⌘K поиск по всему контенту
│   │   ├── dashboard/
│   │   │   ├── DailyScore.tsx        ← анимированное SVG-кольцо прогресса дня
│   │   │   ├── QuickMetrics.tsx      ← 2×2 сетка ключевых метрик
│   │   │   ├── TodayCard.tsx         ← задачи на сегодня
│   │   │   ├── HabitProgressRing.tsx ← прогресс привычек
│   │   │   ├── MacroBar.tsx          ← макросы питания
│   │   │   └── WeeklyStats.tsx       ← статистика недели
│   │   ├── tasks/                    ← TaskCard, TaskList, TaskForm
│   │   ├── habits/                   ← HabitCard, HabitCalendar, HabitForm
│   │   └── shared/                   ← GlassCard, AnimatedNumber, ProgressRing, EmptyState, LoadingSkeleton
│   ├── lib/
│   │   ├── api/                      ← Axios-модули по доменам (auth, tasks, habits, finance...)
│   │   ├── hooks/                    ← TanStack Query хуки + useRealtimeEvents (WebSocket)
│   │   ├── stores/                   ← Zustand хранилища (authStore)
│   │   ├── schemas/                  ← Zod схемы для валидации форм
│   │   └── utils.ts                  ← cn(), formatDate(), getGreeting(), getMoodColor() и др.
│   └── types/
│       └── api.ts                    ← TypeScript типы ответов API
├── .env.local                        ← переменные окружения (не в git)
├── CLAUDE.md                         ← контекст для AI-ассистента
└── next.config.ts
```

---

## Аутентификация

1. При логине/регистрации бэкенд возвращает токены через HttpOnly cookies
2. `useAuthStore` (Zustand + persist) хранит `user` и токены под ключом `habitforge-auth`
3. Axios-интерсептор автоматически добавляет `Authorization: Bearer <token>` к каждому запросу
4. При получении 401 — автоматически запрашивается новый access-токен через `POST /auth/refresh`
5. Если refresh не удался — `clear()` + перенаправление на `/login`

---

## Real-time

WebSocket-соединение устанавливается автоматически после авторизации (`useRealtimeEvents`). Обновления по задачам, тренировкам и финансам инвалидируют соответствующие TanStack Query кэши — данные обновляются без перезагрузки страницы.

---

## Дорожная карта

- [x] Глобальный поиск `Ctrl/⌘ K`
- [x] Повторяющиеся задачи (daily / weekly / monthly)
- [x] Страница аналитики `/stats`
- [x] Финансовый трекер `/finance`
- [x] Плавающая кнопка быстрого создания (FAB)
- [x] WebSocket real-time обновления
- [x] Мобильная навигация (hamburger menu)
- [x] Подзадачи, Проекты, Теги для задач
- [x] Streak freeze для привычек
- [x] Pomodoro-таймер в сайдбаре
- [x] Web Push уведомления (VAPID + service worker)
- [x] Drag-and-drop сортировка задач
- [x] Delete confirmations (Finance, Nutrition)
- [x] Loading states / skeletons на всех страницах
- [ ] Kanban-вид задач
- [ ] Onboarding для новых пользователей
- [ ] Экспорт данных (CSV / JSON)
- [ ] PWA / оффлайн-режим
- [ ] Публичный профиль / лидерборд

---

## Лицензия

MIT
