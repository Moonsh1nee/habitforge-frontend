# HabitForge Frontend — Контекст для Claude

## Стек (точные версии)

| Слой | Технология | Версия |
|---|---|---|
| Фреймворк | Next.js (App Router) | 16.2.6 |
| UI Runtime | React | 19.2.4 |
| Язык | TypeScript | ~5 |
| Стили | Tailwind CSS v4 | ^4 |
| UI-компоненты | shadcn/ui v4 | — |
| Анимации | Motion for React | ^12.40.0 |
| Серверное состояние | TanStack Query | ^5.100.14 |
| Клиентское состояние | Zustand | ^5.0.13 |
| Формы | React Hook Form | ^7.76.1 |
| Валидация | Zod | ^4.4.3 |
| Графики | Recharts | ^3.8.1 |
| Иконки | Lucide React | ^1.16.0 |
| HTTP-клиент | Axios | ^1.16.1 |
| Уведомления | Sonner | ^2.0.7 |
| Дата/время | date-fns | ^4.3.0 |
| DnD | @dnd-kit/core + sortable | ^6 / ^10 |
| Heatmap | react-activity-calendar | ^3.2.0 |

## Критические API-особенности (не путать)

### Motion for React
```ts
// ПРАВИЛЬНО
import { motion, AnimatePresence, useSpring } from "motion/react";
// НЕПРАВИЛЬНО — старый пакет, не используем
import { motion } from "framer-motion";
```

### Tailwind v4 — CSS-first конфиг
- **НЕТ** `tailwind.config.ts` — конфиг живёт в `src/app/globals.css` через `@theme {}`
- Кастомные цвета добавляются только туда
- `@import "tailwindcss"` и `@import "tw-animate-css"` в начале globals.css

### Zod v4 + React Hook Form
```ts
// z.infer — это OUTPUT тип (с defaults применёнными)
// Для useForm нужен INPUT тип:
export type TaskInput = z.input<typeof taskSchema>; // ПРАВИЛЬНО
export type TaskInput = z.infer<typeof taskSchema>; // НЕПРАВИЛЬНО — resolver ругается
```

### react-activity-calendar
```ts
// ПРАВИЛЬНО — named import
import { ActivityCalendar } from "react-activity-calendar";
// НЕПРАВИЛЬНО — нет default export
import ActivityCalendar from "react-activity-calendar";
```

### shadcn/ui v4 — Select `onValueChange`
`onValueChange` типизирует аргумент как `string | null | undefined`, не `string`.
Паттерн защиты:
```ts
// sentinel-значение для "ничего не выбрано" — обязательно проверять !v
<Select value={tagId ?? "all"} onValueChange={(v) => setTagId(!v || v === "all" ? undefined : v)}>
<Select value={projectId ?? "none"} onValueChange={(v) => setProjectId(!v || v === "none" ? undefined : v)}>
```

## Структура проекта

```
src/
├── app/
│   ├── (auth)/              ← layout с animated mesh background
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/               ← защищённые маршруты
│   │   ├── layout.tsx       ← Sidebar + Topbar + PageTransition + PomodoroTicker + FullPageSkeleton
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── habits/page.tsx
│   │   ├── workouts/page.tsx
│   │   ├── nutrition/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── finance/page.tsx
│   │   ├── shopping/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── upgrade/page.tsx
│   │   ├── achievements/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── admin/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx           ← root: Providers + Geist font + dark class
│   ├── page.tsx             ← redirect → /dashboard
│   ├── globals.css          ← @theme {} + .glass + animations
│   └── Providers.tsx        ← QueryClientProvider + Sonner Toaster
├── middleware.ts            ← Edge: refresh_token cookie → protect (app)/* routes
├── components/
│   ├── ui/                  ← shadcn генерирует сюда (не трогать вручную)
│   ├── layout/
│   │   ├── Sidebar.tsx      ← motion layoutId + PomodoroSidebarSection + ProjectsSection
│   │   ├── Topbar.tsx
│   │   ├── AuthBootstrap.tsx ← fetches /users/me, syncs user+plan to stores, redirects
│   │   ├── PageTransition.tsx ← AnimatePresence по pathname
│   │   ├── QuickAddFab.tsx  ← плавающая кнопка быстрого создания
│   │   ├── GlobalSearch.tsx ← Ctrl/⌘K поиск
│   │   └── PomodoroWidget.tsx ← экспортирует PomodoroTicker (null-render, в layout) + PomodoroSidebarSection (UI, в Sidebar)
│   ├── dashboard/           ← TodayCard, HabitProgressRing, MacroBar, WeeklyStats
│   ├── tasks/               ← TaskCard (subtasks, project, tags), TaskList (DnD), TaskForm, ProjectsManager, ViewSwitcher
│   ├── habits/              ← HabitCard (freeze btn), HabitForm, HabitCalendar
│   ├── workouts/            ← LogCard, PlanCard, LogForm, PlanForm, ExerciseForm
│   ├── finance/             ← EmojiPicker, CategoryManager, TransactionDialog, TransactionList, ExpensePieChart
│   ├── nutrition/           ← AddFoodForm, NutritionPlanForm, MealTemplateForm, NutritionPlanCard
│   ├── shopping/            ← ShoppingListCard, ListFormDialog, CompleteDialog, AddItemForm, ListDetailSheet, helpers.ts
│   ├── profile/             ← ProfileTab, SecurityTab, PushNotificationsCard, TelegramReminderForm, TelegramTab, DataTab, SubscriptionTab, ModulesTab
│   ├── stats/               ← MetricCard, HabitStreakRow, MoodEnergyChart, WorkoutHistoryChart, WeightTrendChart
│   ├── billing/             ← PricingCard, FeatureComparisonTable, UpgradePrompt
│   ├── gamification/        ← XpBar, AchievementCard, AchievementGrid
│   ├── goals/               ← GoalCard, GoalForm
│   └── shared/              ← GlassCard, AnimatedNumber, ProgressRing, EmptyState, LoadingSkeleton, FullPageSkeleton, ConfirmDeleteDialog, ColorPicker, PageHeader, FormDialog, FilterTabs, SelectOption, CollapsibleBody, StatCard
├── lib/
│   ├── api/
│   │   ├── client.ts        ← Axios instance + withCredentials:true + 401 refresh (cookie-based)
│   │   ├── auth.ts, tasks.ts, habits.ts, workouts.ts
│   │   ├── nutrition.ts, journal.ts, dashboard.ts, users.ts, finance.ts, shopping.ts
│   │   ├── projects.ts      ← CRUD /projects
│   │   ├── tags.ts          ← CRUD /tags + POST /tasks/{id}/tags
│   │   ├── telegram.ts      ← bot link + reminders
│   │   └── push.ts          ← VAPID key + subscribe /push/*
│   ├── hooks/               ← useAuth, useTasks, useHabits, useDashboard, useProjects, useTags, useNutrition, useShopping, usePlan, useWorkouts, useInsights
│   ├── stores/
│   │   ├── authStore.ts     ← Zustand + persist (user объект; cookies держат сессию)
│   │   ├── pomodoroStore.ts ← Zustand: phase, timeLeft, selectedTaskId, sessionCount
│   │   ├── planStore.ts     ← Zustand: plan ("free"|"pro"), limits
│   │   ├── taskViewStore.ts ← Zustand: viewMode (list/kanban/matrix), kanbanGroupBy
│   │   └── onboardingStore.ts ← Zustand + persist: modules[], setModules, MODULES const
│   ├── constants/
│   │   ├── chartStyles.ts   ← TOOLTIP_STYLE для Recharts
│   │   └── motionVariants.ts ← staggerContainer, fadeUpItem
│   ├── schemas/             ← Zod v4 схемы; всегда z.input<> для типов форм (не z.infer)
│   └── utils.ts             ← cn(), formatDate(), getGreeting(), getPriorityColor(), getTodayString()
├── types/
│   └── api.ts               ← все TypeScript-типы (User, Task, Habit, Project, Tag, FoodLog, DailySummary, ShoppingList, ...)
└── public/
    ├── sw.js                ← Service Worker для Web Push уведомлений
    └── icon.svg             ← логотип (используется в sw.js для уведомлений)
```

## Pomodoro — архитектура

Pomodoro разбит на два компонента во избежание двойного тика (Sidebar рендерится дважды: desktop aside + mobile Sheet):

- **`PomodoroTicker`** — рендерит `null`, живёт в `layout.tsx` единожды. Владеет `setInterval`, считает время, показывает toast при смене фазы, инициализирует `sessionCount`.
- **`PomodoroSidebarSection`** — только UI. Читает состояние из `pomodoroStore`. Рендерится в `Sidebar.tsx`. Compact header (иконка + фаза + отсчёт + кнопка play/pause) всегда виден; expanded-блок раскрывается по клику.

**Никогда не помещать `setInterval` в `PomodoroSidebarSection`** — это вызовет двойной тик.

## Дизайн-система

### CSS переменные (globals.css @theme)
```css
--color-background:   #0a0a0f
--color-surface:      rgba(255,255,255,0.04)  ← glass-карточки
--color-border:       rgba(255,255,255,0.08)
--color-primary:      #7c3aed                 ← violet-600
--color-primary-glow: rgba(124,58,237,0.35)
--color-accent:       #06b6d4                 ← cyan-500
--color-success:      #22c55e
--color-warning:      #f59e0b
--color-danger:       #ef4444
--color-text:         #f1f5f9
--color-muted:        #64748b
```

### Утилита .glass
```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### Анимации (Motion for React)
- **Page transition**: `opacity 0→1`, `y 20→0`, duration 0.3s — в `PageTransition.tsx`
- **Card hover**: `whileHover={{ scale: 1.02, boxShadow: "0 0 20px var(--color-primary-glow)" }}`
- **Stagger lists**: `staggerChildren: 0.05–0.07` в parent variants
- **AnimatedNumber**: `useMotionValue` + `useSpring` + `useTransform`
- **ProgressRing**: SVG circle с `strokeDashoffset` через `motion.circle`

## Паттерны разработки

### Новая страница
1. Создать файл в `src/app/(app)/<route>/page.tsx`
2. Добавить иконку + href в `Sidebar.tsx` (массив `navItems`)
3. Если нужен API — добавить функции в `src/lib/api/<domain>.ts`
4. Если нужен хук — создать `src/lib/hooks/use<Domain>.ts`
5. Если нужна форма — создать схему в `src/lib/schemas/<domain>.schema.ts`

### Новый API-модуль
```ts
// src/lib/api/example.ts
import { api } from "./client";  // Axios instance с Bearer токеном

export const exampleApi = {
  getAll: async (): Promise<SomeType[]> => {
    const { data } = await api.get<SomeType[]>("/example");
    return data;
  },
};
```

### Новый TanStack Query хук
```ts
// src/lib/hooks/useExample.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useExamples() {
  return useQuery({ queryKey: ["examples"], queryFn: exampleApi.getAll });
}

export function useCreateExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: exampleApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["examples"] }); toast.success("..."); },
    onError: () => toast.error("..."),
  });
}
```

### Форма с Zod + RHF
```ts
// Схема — использовать z.input<> для типа формы
const schema = z.object({ name: z.string().min(1) });
type FormInput = z.input<typeof schema>; // НЕ z.infer

// В компоненте
const { register, handleSubmit } = useForm<FormInput>({
  resolver: zodResolver(schema),
});
```

### GlassCard с hover
```tsx
<GlassCard hover onClick={() => ...}>
  {/* content */}
</GlassCard>
```

### Защита от undefined из API
Всегда использовать `??` при доступе к полям ответа:
```ts
const items = data?.items ?? [];
const total = data?.total ?? 0;
const value = data?.nested?.field ?? 0;
```

## Auth-флоу
1. Сессия хранится в HTTP-only cookies (устанавливаются бэкендом при логине/регистрации)
2. `useAuthStore` (Zustand + persist) хранит только объект `user` (не токены — они в cookies)
3. `Axios` настроен с `withCredentials: true` — браузер автоматически передаёт cookies
4. При 401 — interceptor делает `POST /auth/refresh` (тоже с cookies) и повторяет запрос
5. При ошибке refresh — `clear()` + redirect на `/login`
6. `AuthBootstrap` в app layout вызывает `GET /users/me` при старте — синхронизирует user+plan в stores
7. `src/middleware.ts` — Edge-middleware проверяет cookie `refresh_token`: защищённые роуты без cookie → `/login`

## Переменные окружения
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Запуск
```bash
npm run dev      # http://localhost:3000
npm run build    # production build (0 TS ошибок)
npm run start    # production server
```

Бэкенд должен быть запущен на `:8000`:
```bash
# habitforge-backend/
uvicorn src.main:app --reload
```

## Известные особенности бэкенда
- Поля в ответе могут отсутствовать (null/undefined) даже если они есть в TypeScript-типах — всегда защищать `??`
- `GET /dashboard/week` возвращает `tasks`, `habits`, `workouts`, `nutrition`, `journal` — но некоторые могут быть пустыми объектами без ожидаемых полей
- `GET /nutrition/logs/summary` возвращает объект, но `entries` может отсутствовать если записей нет

## Подключённые backend-эндпоинты

| Домен | Эндпоинты |
|---|---|
| Подзадачи | `GET /tasks/{id}/subtasks`, `POST /tasks/{id}/subtasks` |
| Проекты | `GET/POST /projects`, `GET/PATCH/DELETE /projects/{id}` |
| Теги | `GET/POST /tags`, `GET/PATCH/DELETE /tags/{id}`, `POST /tasks/{id}/tags`, `DELETE /tasks/{id}/tags/{tagId}` |
| Стрик-заморозка | `POST /habits/{id}/freeze` |
| Push-уведомления | `GET /push/vapid-key`, `POST /push/subscribe`, `DELETE /push/unsubscribe` |

Service worker регистрируется в `src/app/(app)/profile/page.tsx` при включении push-уведомлений. Файл `public/sw.js` обрабатывает `push` event и `notificationclick`.
