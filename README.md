# HabitForge

**HabitForge** — персональная система трекинга привычек, задач и здоровья. Объединяет в одном интерфейсе управление задачами, отслеживание привычек, тренировки, питание и ежедневный дневник.

---

## Что умеет

| Модуль | Возможности |
|---|---|
| **Дашборд** | Агрегированный обзор дня: задачи, привычки, макросы, дневник, статистика недели |
| **Задачи** | Создание / редактирование / удаление, приоритеты (низкий → критический), дедлайны, фильтры |
| **Привычки** | Ежедневная отметка, стрики, calendar heatmap за 52 недели, статистика выполнения |
| **Тренировки** | Логирование тренировок, шаблоны-планы с упражнениями |
| **Питание** | КБЖУ за день (donut-диаграмма), лог приёмов пищи по типам (завтрак/обед/ужин/перекус) |
| **Дневник** | Слайдеры настроения / энергии / стресса / сна, вес, заметки, динамика за 30 дней |
| **Профиль** | Редактирование данных, смена пароля, привязка Telegram-бота |

---

## Стек

### Frontend (этот репозиторий)

- **[Next.js 16](https://nextjs.org/)** — App Router, React Server Components
- **[React 19](https://react.dev/)** — UI runtime
- **[TypeScript](https://www.typescriptlang.org/)** — строгая типизация
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first конфиг через `@theme {}`
- **[shadcn/ui v4](https://ui.shadcn.com/)** — базовые UI-компоненты
- **[Motion for React](https://motion.dev/)** — анимации (glassmorphism, stagger, page transitions)
- **[TanStack Query v5](https://tanstack.com/query)** — серверное состояние и кэш
- **[Zustand v5](https://zustand-demo.pmnd.rs/)** — клиентское состояние (auth токены)
- **[React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/)** — формы и валидация
- **[Recharts](https://recharts.org/)** — графики (area, pie, line)
- **[Axios](https://axios-http.com/)** — HTTP-клиент с автоматическим refresh токенов
- **[Sonner](https://sonner.emilkowal.ski/)** — toast-уведомления
- **[react-activity-calendar](https://grubersjoe.github.io/react-activity-calendar/)** — heatmap привычек

### Backend (отдельный репозиторий)

- **FastAPI** + **SQLModel** + **PostgreSQL** + **Redis**
- Async SQLAlchemy 2.x + asyncpg
- JWT-аутентификация с refresh-токенами и blacklist через Redis
- Telegram-бот на aiogram 3.x
- 90+ тестов, Alembic-миграции

---

## Дизайн

Тёмная тема с glassmorphism-эстетикой:

- Фон: `#0a0a0f` (очень тёмный синевато-чёрный)
- Карточки: `rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)`
- Акцент: `#7c3aed` (violet) и `#06b6d4` (cyan)
- Все анимации через Motion for React — плавные переходы страниц, hover-эффекты, stagger-списки

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
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Приложение автоматически перенаправит на `/login` при первом посещении.

### Сборка для продакшена

```bash
npm run build
npm run start
```

---

## Структура проекта

```
habitforge-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/               ← страницы входа и регистрации
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/                ← защищённые страницы приложения
│   │   │   ├── layout.tsx        ← Sidebar + Topbar + анимированные переходы
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── habits/
│   │   │   ├── workouts/
│   │   │   ├── nutrition/
│   │   │   ├── journal/
│   │   │   └── profile/
│   │   ├── layout.tsx            ← корневой layout: шрифты, Providers
│   │   ├── globals.css           ← дизайн-система: @theme {}, .glass, анимации
│   │   └── Providers.tsx         ← QueryClient + Toaster
│   ├── components/
│   │   ├── ui/                   ← shadcn/ui компоненты (не редактировать вручную)
│   │   ├── layout/               ← Sidebar, Topbar, PageTransition
│   │   ├── dashboard/            ← виджеты дашборда
│   │   ├── tasks/                ← TaskCard, TaskList, TaskForm
│   │   ├── habits/               ← HabitCard, HabitCalendar, HabitForm
│   │   └── shared/               ← GlassCard, AnimatedNumber, ProgressRing, EmptyState
│   ├── lib/
│   │   ├── api/                  ← Axios-модули по доменам (auth, tasks, habits...)
│   │   ├── hooks/                ← TanStack Query хуки (useAuth, useTasks, useHabits...)
│   │   ├── stores/               ← Zustand хранилища (authStore)
│   │   ├── schemas/              ← Zod схемы для валидации форм
│   │   └── utils.ts              ← cn(), formatDate(), getGreeting() и др.
│   └── types/
│       └── api.ts                ← TypeScript типы ответов API
├── .env.local                    ← переменные окружения (не в git)
├── CLAUDE.md                     ← контекст для AI-ассистента
└── next.config.ts
```

---

## Аутентификация

1. При логине/регистрации бэкенд возвращает `access_token` и `refresh_token`
2. Токены сохраняются в `localStorage` через Zustand persist (ключ `habitforge-auth`)
3. Axios-интерсептор автоматически добавляет `Authorization: Bearer <token>` к каждому запросу
4. При получении 401 — автоматически запрашивается новый access-токен через `POST /auth/refresh`
5. Если refresh не удался — пользователь перенаправляется на `/login`

---

## Дорожная карта

- [ ] Middleware для защиты роутов на уровне сервера
- [ ] Мобильная навигация (hamburger menu)
- [ ] Полная интеграция Telegram-бота
- [ ] Kanban-вид задач с drag-and-drop (`@dnd-kit` уже установлен)
- [ ] Экспорт данных (CSV / JSON)
- [ ] PWA / оффлайн-режим

---

## Лицензия

MIT
