# GetGrip API Reference

> Base URL: `http://localhost:8000`  
> Версия бекенда: **0.4.0**  
> Все защищённые эндпоинты требуют заголовок: `Authorization: Bearer <access_token>`

---

## TypeScript типы

```typescript
// ─── Базовые примитивы ────────────────────────────────────────────────────────

type UUID         = string   // "550e8400-e29b-41d4-a716-446655440000"
type ISODatetime  = string   // "2026-05-26T10:30:00" (UTC, без timezone-суффикса)
type ISODate      = string   // "2026-05-26"

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface User {
  id:         UUID
  email:      string | null
  phone:      string | null
  username:   string | null
  firstName:  string
  lastName:   string | null
  avatarUrl:  string | null   // "/media/avatars/{filename}" — prepend BASE_URL для показа
  bio:        string | null
  timezone:   string          // IANA timezone, default: "Europe/Moscow"
  isActive:   boolean
  createdAt:  ISODatetime
  updatedAt:  ISODatetime
}

interface TokenResponse {
  access_token:  string
  refresh_token: string
  token_type:    "bearer"
  user:          User
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

type TaskPriority = 1 | 2 | 3   // 1=HIGH, 2=MEDIUM, 3=LOW
type Recurrence   = "daily" | "weekly" | "monthly"

interface Task {
  id:          UUID
  userId:      UUID
  title:       string
  description: string | null
  priority:    TaskPriority     // default: 2
  dueDate:     ISODatetime | null
  completed:   boolean
  completedAt: ISODatetime | null
  isRecurring: boolean
  recurrence:  Recurrence | null
  createdAt:   ISODatetime
  updatedAt:   ISODatetime
}

// ─── Habits ───────────────────────────────────────────────────────────────────

type HabitFrequency = "daily" | "weekly" | "weekdays"

interface Habit {
  id:            UUID
  userId:        UUID
  title:         string
  description:   string | null
  icon:          string | null    // emoji, max 50 chars
  color:         string           // hex "#22d3ee", max 7 chars
  frequency:     HabitFrequency
  targetPerWeek: number | null    // только для frequency="weekly", 1..7
  weekdays:      number[] | null  // только для frequency="weekdays", 1=пн..7=вс
  isArchived:    boolean
  createdAt:     ISODatetime
  updatedAt:     ISODatetime
}

interface HabitLog {
  id:        UUID
  habitId:   UUID
  userId:    UUID
  date:      ISODate
  completed: boolean
  note:      string | null
  createdAt: ISODatetime
}

interface HabitStats {
  total_completed: number
  current_streak:  number
  longest_streak:  number
  start_date:      ISODate | null
  end_date:        ISODate | null
}

// ─── Journal ──────────────────────────────────────────────────────────────────

interface DailyEntry {
  id:           UUID
  userId:       UUID
  date:         ISODate
  mood:         number | null   // 1..10
  energy:       number | null   // 1..10
  stressLevel:  number | null   // 1..10
  sleepHours:   number | null   // 0..24
  sleepQuality: number | null   // 1..10
  weight:       number | null   // кг, >= 0
  notes:        string | null
  wins:         string | null
  improvements: string | null
  createdAt:    ISODatetime
  updatedAt:    ISODatetime
}

interface WeightPoint {
  date:   ISODate
  weight: number
}

interface JournalStats {
  period_start:      ISODate | null
  period_end:        ISODate | null
  entries_count:     number
  avg_mood:          number | null
  avg_energy:        number | null
  avg_stress:        number | null
  avg_sleep_hours:   number | null
  avg_sleep_quality: number | null
  weight_history:    WeightPoint[]
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

type ReminderType = "habit" | "task" | "medication" | "custom"

interface TelegramLink {
  chatId:   number
  username: string | null
  isActive: boolean
  linkedAt: ISODatetime
}

interface Reminder {
  id:             UUID
  userId:         UUID
  type:           ReminderType
  title:          string
  message:        string | null
  cronExpression: string
  isActive:       boolean
  lastSentAt:     ISODatetime | null
  createdAt:      ISODatetime
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface HabitToday {
  id:              UUID
  title:           string
  icon:            string | null
  color:           string
  frequency:       HabitFrequency
  completed_today: boolean
}

interface TodayDashboard {
  date:               ISODate
  tasks_pending:      Task[]
  tasks_overdue:      Task[]
  habits:             HabitToday[]
  journal_entry:      DailyEntry | null
}

interface WeekStats {
  week_start:             ISODate
  week_end:               ISODate
  tasks_completed:        number   // задачи с dueDate в текущей неделе, отмеченные выполненными
  tasks_total:            number   // задачи с dueDate в текущей неделе (независимо от статуса)
  habits_completion_rate: number   // процент, 0..100, 1 знак после запятой
  avg_mood:               number | null
  avg_energy:             number | null
  avg_sleep_hours:        number | null
}

// ─── Search ───────────────────────────────────────────────────────────────────

interface SearchResultItem {
  type:            "task" | "habit" | "journal"
  id:              UUID
  title:           string
  description?:    string | null
  // task-specific
  completed?:      boolean
  priority?:       TaskPriority
  dueDate?:        ISODatetime | null
  // journal-specific
  date?:           ISODate
  notes?:          string
}

interface SearchResponse {
  results: SearchResultItem[]
  total:   number
  query:   string
}

// ─── Health ───────────────────────────────────────────────────────────────────

interface HealthResponse {
  status:  "ok" | "degraded"
  db:      "ok" | string
  redis:   "ok" | string
  version: string            // "0.4.0"
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationParams {
  skip?:  number   // default: 0
  limit?: number   // default: 20, max: 100
}

// ─── Ошибки ───────────────────────────────────────────────────────────────────

interface ApiError {
  detail: string
}

interface ValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}
```

---

## Заголовки

| Заголовок | Значение | Когда |
|-----------|----------|-------|
| `Authorization` | `Bearer <access_token>` | Все защищённые эндпоинты |
| `Content-Type` | `application/json` | POST/PATCH/PUT с JSON телом |
| `Content-Type` | `multipart/form-data` | `POST /users/me/avatar` |

---

## Коды ответов

| Код | Когда |
|-----|-------|
| `200` | Успех (GET, некоторые POST) |
| `201` | Ресурс создан |
| `204` | Нет тела ответа (DELETE, logout, change-password) |
| `400` | Бизнес-логика: дубль email, неверный пароль |
| `401` | Нет токена / истёк / заблокирован |
| `403` | Доступ запрещён (чужой ресурс, webhook secret) |
| `404` | Ресурс не найден |
| `409` | Конфликт: duplicate journal entry, unique constraint |
| `413` | Файл слишком большой (avatar > 5 MB) |
| `422` | Ошибка валидации Pydantic |
| `429` | Rate limit превышен (`Retry-After: 60` в заголовках) |
| `503` | Сервис недоступен (health check degraded) |

---

## AUTH `/auth`

### `POST /auth/register`

```typescript
interface RegisterRequest {
  firstName:  string        // обязательно
  email?:     string | null
  phone?:     string | null
  username?:  string | null
  lastName?:  string | null
  bio?:       string | null
  timezone?:  string        // default: "Europe/Moscow"
  password:   string        // мин 8 символов + мин 1 цифра + мин 1 заглавная буква
}

// Response 201: User
// Response 400: "Email already registered" | "Username already registered"
// Response 422: слабый пароль или отсутствие firstName
```

### `POST /auth/login`

```typescript
interface LoginRequest { email: string; password: string }

// Response 200: TokenResponse
// Response 401: "Incorrect email or password"
```

### `POST /auth/refresh`

```typescript
interface RefreshRequest { refresh_token: string }

// Response 200: TokenResponse  (старый refresh_token отзывается, выдаётся новый)
// Response 401: "Invalid refresh token" | "Refresh token expired or revoked"
```

> Refresh-токен одноразовый — после `/refresh` старый больше не работает.

### `POST /auth/logout`

```typescript
// Headers: Authorization required
// Response 204 — access-токен добавляется в Redis blacklist до истечения TTL
```

### `POST /auth/logout/all`

```typescript
// Headers: Authorization required
// Response 204 — все refresh-токены пользователя отзываются одним запросом
```

### `POST /auth/forgot-password`

```typescript
{ email: string }

// Response 200: { message: "If that email is registered, a reset link has been sent." }
// Всегда 200 — не раскрывает, зарегистрирован ли email. Токен действителен 15 минут.
```

### `POST /auth/reset-password`

```typescript
interface ResetPasswordRequest {
  token:        string   // из ссылки в письме (?token=...)
  new_password: string   // мин 8 символов + мин 1 цифра + мин 1 заглавная буква
}

// Response 200: { message: "Password updated successfully." }
// Response 400: "Invalid or expired reset token"
// После успеха все refresh-токены пользователя отзываются
```

---

## USERS `/users`

### `GET /users/me`  →  `200: User`

### `PATCH /users/me`

```typescript
interface UserUpdateRequest {
  firstName?: string
  lastName?:  string
  bio?:       string
  timezone?:  string   // IANA timezone: "Europe/Moscow", "UTC", "America/New_York"
}

// Response 200: User
// avatarUrl обновляется только через POST /users/me/avatar
```

### `PUT /users/me/password`

```typescript
interface PasswordChangeRequest {
  currentPassword: string
  newPassword:     string   // мин 8 символов + мин 1 цифра + мин 1 заглавная буква
}

// Response 204
// Response 400: "Current password is incorrect"
```

### `POST /users/me/avatar`

```typescript
// Content-Type: multipart/form-data, field: "file"
// Допустимые типы: image/jpeg, image/png, image/webp, image/gif
// Максимум: 5 MB

// Response 200: { avatarUrl: string }   // "/media/avatars/{uuid}_{hash}.{ext}"
// Полный URL: `${BASE_URL}${avatarUrl}`
// Response 413: файл слишком большой
// Response 422: недопустимый тип файла
```

```typescript
// Пример:
const formData = new FormData()
formData.append("file", file)
const { data } = await api.post("/users/me/avatar", formData, {
  headers: { "Content-Type": "multipart/form-data" },
})
```

### `GET /users/me/export`

```typescript
{ format?: "json" | "csv" }   // default: "json"

// json → application/json, filename: habitforge-export.json
// csv  → application/zip,  filename: habitforge-export.zip
//        содержит: tasks.csv, habits.csv, habit_logs.csv, food_logs.csv,
//                  journal.csv
```

### `DELETE /users/me`

```typescript
interface DeleteAccountRequest {
  currentPassword: string   // подтверждение — только текущий пароль
}

// Response 204 — аккаунт и все данные удалены каскадно
// Response 400: "Password is incorrect"
```

---

## TASKS `/tasks`

### `POST /tasks/`

```typescript
interface TaskCreateRequest {
  title:        string                              // мин 1 символ
  description?: string
  priority?:    1 | 2 | 3                          // default: 2
  dueDate?:     ISODatetime                        // timezone нормализуется в UTC
  completed?:   boolean
  isRecurring?: boolean
  recurrence?:  "daily" | "weekly" | "monthly"
}

// Response 201: Task
```

### `GET /tasks/`

```typescript
interface TaskListParams extends PaginationParams {
  completed?:  boolean
  priority?:   1 | 2 | 3
  due_before?: ISODatetime
  due_after?:  ISODatetime
  search?:     string         // поиск по title, ILIKE, max 200 символов
  order_by?:   "dueDate" | "priority" | "createdAt" | "updatedAt"  // default: "createdAt"
  order?:      "asc" | "desc"   // default: "desc"
}

// Response 200: Task[]
```

### `GET /tasks/{task_id}`  →  `200: Task | 404`

### `PATCH /tasks/{task_id}`

```typescript
interface TaskUpdateRequest {
  title?:       string
  description?: string
  priority?:    1 | 2 | 3
  dueDate?:     ISODatetime | null
  completed?:   boolean   // при true — автоматически ставится completedAt
  isRecurring?: boolean
  recurrence?:  "daily" | "weekly" | "monthly" | null
}

// Response 200: Task
// При завершении рекуррентной задачи автоматически создаётся следующая
// Генерирует WS-событие task.updated + инвалидирует dashboard-кэш
```

> `PUT /tasks/{task_id}` — алиас для PATCH, работает идентично.

### `DELETE /tasks/{task_id}`  →  `204`
> Генерирует WS-событие task.deleted + инвалидирует dashboard-кэш

### `POST /tasks/bulk-complete`

```typescript
interface BulkCompleteRequest { ids: UUID[] }

// Response 200: Task[]  (только обновлённые задачи)
// Рекуррентные: для каждой создаётся следующая
// Задачи чужих userId и уже завершённые молча игнорируются
```

---

## HABITS `/habits`

### `POST /habits/`

```typescript
interface HabitCreateRequest {
  title:         string
  description?:  string
  icon?:         string                             // emoji, макс 50 символов
  color?:        string                             // hex "#22d3ee"; default: "#22d3ee"
  frequency?:    "daily" | "weekly" | "weekdays"   // default: "daily"
  targetPerWeek?: number                            // 1..7; ТОЛЬКО для "weekly"
  weekdays?:     number[]                           // 1=пн..7=вс; ТОЛЬКО для "weekdays"
}

// Правила:
//   daily     → targetPerWeek и weekdays запрещены
//   weekly    → targetPerWeek обязателен (1..7), weekdays запрещён
//   weekdays  → weekdays обязателен (значения 1..7), targetPerWeek запрещён

// Response 201: Habit
// Response 400: нарушение правил расписания
```

### `GET /habits/`

```typescript
{ ...PaginationParams, archived?: boolean }   // default archived: false

// Response 200: Habit[]
```

### `GET /habits/{habit_id}`  →  `200: Habit | 404`

### `PUT /habits/{habit_id}`

```typescript
interface HabitUpdateRequest {
  title?:         string
  description?:   string
  icon?:          string
  color?:         string
  frequency?:     "daily" | "weekly" | "weekdays"
  targetPerWeek?: number | null
  weekdays?:      number[] | null
}

// Response 200: Habit
```

### `PATCH /habits/{habit_id}/archive`

```typescript
// Нет тела — toggles isArchived (true↔false)
// Response 200: Habit
```

### `DELETE /habits/{habit_id}`  →  `204`  (все HabitLog тоже удаляются)

### `POST /habits/{habit_id}/logs`

```typescript
interface HabitLogCreateRequest {
  date?: ISODate   // default: сегодня по timezone пользователя
  note?: string
}

// Response 201: HabitLog
// Response 400: "Habit is not scheduled for this date"
// Если лог за эту дату уже есть — обновляется (upsert)
// Генерирует WS-событие habit.checked + инвалидирует dashboard-кэш
```

### `POST /habits/{habit_id}/logs/bulk`

```typescript
interface HabitLogBulkRequest {
  dates: ISODate[]   // ["2026-05-20", "2026-05-21", ...]
  note?: string
}

// Response 201: HabitLog[]
// Даты вне расписания weekdays молча пропускаются
```

### `DELETE /habits/{habit_id}/logs/{log_date}`  →  `204 | 404`
> Path param `log_date`: `"2026-05-26"`

### `GET /habits/{habit_id}/logs`

```typescript
{ start?: ISODate, end?: ISODate }
// Response 200: HabitLog[]  (по date ASC)
```

### `GET /habits/{habit_id}/stats`

```typescript
{ start?: ISODate, end?: ISODate }   // default end: сегодня
// Response 200: HabitStats
```

---

## JOURNAL `/journal`

### `POST /journal/entries`

```typescript
interface DailyEntryCreateRequest {
  date?:         ISODate   // default: сегодня по timezone пользователя
  mood?:         number    // 1..10
  energy?:       number    // 1..10
  stressLevel?:  number    // 1..10
  sleepHours?:   number    // 0..24
  sleepQuality?: number    // 1..10
  weight?:       number    // кг, >= 0
  notes?:        string
  wins?:         string
  improvements?: string
}

// Response 201: DailyEntry
// Response 409: "Journal entry for this date already exists" → используй PATCH
// Генерирует WS-событие journal.updated + инвалидирует dashboard-кэш
```

### `GET /journal/entries`

```typescript
{ ...PaginationParams, start?: ISODate, end?: ISODate }
// Response 200: DailyEntry[]  (по date DESC)
```

### `GET /journal/entries/{entry_date}`  →  `200: DailyEntry | 404`
> Path param: `"2026-05-26"`

### `PATCH /journal/entries/{entry_date}`

```typescript
// Те же поля что у Create, без date; все опциональны
// Response 200: DailyEntry
// Генерирует WS-событие journal.updated + инвалидирует dashboard-кэш
```

### `DELETE /journal/entries/{entry_date}`  →  `204`

### `GET /journal/stats`

```typescript
{ start?: ISODate, end?: ISODate }
// Response 200: JournalStats
```

---

## TELEGRAM `/telegram`

### `POST /telegram/link/code`

```typescript
// Headers: Authorization required
// Response 201: { code: string }   // 16-символьный hex, TTL 15 минут
// Инструкция: отправь /start <code> боту в Telegram
```

### `GET /telegram/link`  →  `200: TelegramLink | 404`

### `DELETE /telegram/link`  →  `204 | 404`

### `POST /telegram/reminders`

```typescript
interface ReminderCreateRequest {
  type:           "habit" | "task" | "medication" | "custom"   // default: "custom"
  title:          string   // мин 1, макс 150
  message?:       string
  cronExpression: string   // 5-field crontab
}

// Примеры cron:
//   "0 9 * * *"    → каждый день в 9:00 UTC
//   "0 9 * * 1-5"  → пн-пт в 9:00 UTC
//   "30 8 * * 1"   → каждый понедельник в 8:30 UTC
//   "0 */2 * * *"  → каждые 2 часа

// Response 201: Reminder
// Response 422: невалидный cron-формат
```

### `GET /telegram/reminders`

```typescript
{ active_only?: boolean }   // default: true
// Response 200: Reminder[]
```

### `GET /telegram/reminders/{reminder_id}`  →  `200: Reminder | 404`

### `PATCH /telegram/reminders/{reminder_id}`

```typescript
{ title?: string, message?: string, cronExpression?: string, isActive?: boolean }
// Response 200: Reminder
```

### `DELETE /telegram/reminders/{reminder_id}`  →  `204`

### `POST /telegram/webhook`

```typescript
// Вызывает Telegram — НЕ фронтенд
// Header: X-Telegram-Bot-Api-Secret-Token: <secret>
// Response 200: { ok: true }
// Response 403: неверный секрет
```

---

## DASHBOARD `/dashboard`

### `GET /dashboard/today`

```typescript
{ no_cache?: boolean }   // default: false

// Response 200: TodayDashboard
// Кэшируется в Redis на 60 секунд (ключ: dashboard:today:{userId})
// Инвалидируется автоматически при изменении Task, HabitLog, FoodLog, DailyEntry
```

### `GET /dashboard/week`

```typescript
// Response 200: WeekStats
// Неделя: пн..вс текущей ISO-недели по timezone пользователя
```

---

## SEARCH `/search`

### `GET /search`

```typescript
interface SearchParams {
  q:      string     // мин 2, макс 100 символов; % и _ экранируются автоматически
  types?: string[]   // допустимые значения: "tasks" | "habits" | "journal"
                     // default: ["tasks", "habits", "journal"]
  limit?: number     // default: 20, max: 50
}

// Response 200: SearchResponse
// Поиск через ILIKE по:
//   tasks:               title, description
//   habits:              title, description
//   journal:             notes, wins, improvements
```

```typescript
// Примеры:
const { data } = await api.get<SearchResponse>("/search", {
  params: { q: "бег", types: ["tasks", "habits"] },
  // Axios сериализует как ?types=tasks&types=habits
})
```

---

## HEALTH

### `GET /health`

```typescript
// Response 200: HealthResponse  (всё OK)
// Response 503: HealthResponse  (деградированный статус)

// Пример: { "status": "ok", "db": "ok", "redis": "ok", "version": "0.4.0" }
```

---

## WEBSOCKET `ws://{host}/ws/events`

### Подключение

```typescript
// Auth через query param (WebSocket не поддерживает Authorization заголовок)
const ws = new WebSocket(`ws://localhost:8000/ws/events?token=${accessToken}`)

ws.onclose = (e) => {
  if (e.code === 4001) {
    // токен недействителен или отозван
  }
}
```

### Входящие события (server → client)

```typescript
interface WSEvent {
  type: string
  data: Record<string, unknown>
}

// Типы событий:
// "task.updated"      → { id: UUID, completed?: boolean, bulk_complete?: boolean }
// "task.deleted"      → { id: UUID }
// "habit.checked"     → { habitId: UUID, date: ISODate }
// "journal.updated"   → { date: ISODate }
```

```typescript
// Пример обработчика с React Query:
ws.onmessage = (e) => {
  const event: WSEvent = JSON.parse(e.data)
  switch (event.type) {
    case "task.updated":
    case "task.deleted":
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today"] })
      break
    case "habit.checked":
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today"] })
      break
    case "journal.updated":
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today"] })
      break
  }
}
```

### Keep-alive

```typescript
const interval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) ws.send("ping")
}, 30_000)
ws.onclose = () => clearInterval(interval)
```

---

## Pagination

```typescript
// Параметры поддерживаются во всех list-эндпоинтах:
{ skip?: number, limit?: number }   // default: skip=0, limit=20, max limit=100
```

---

## Rate Limiting

| Тип | Лимит | Ключ |
|-----|-------|------|
| Auth эндпоинты (`/auth/login`, `/auth/register`, `/auth/forgot-password`) | 10 req/min | IP |
| Остальные без авторизации | 60 req/min | IP |
| С авторизацией (Bearer токен) | 300 req/min | userId |

При превышении: `429 Too Many Requests` + `Retry-After: 60`

---

## Пример Axios-клиента

```typescript
// src/lib/api/client.ts
import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"] ?? "60"
      toast.error(`Слишком много запросов. Подождите ${retryAfter}с`)
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        const { data } = await axios.post<TokenResponse>(`${BASE_URL}/auth/refresh`, {
          refresh_token: useAuthStore.getState().refreshToken,
        })
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        error.config.headers.Authorization = `Bearer ${data.access_token}`
        return api(error.config)
      } catch {
        useAuthStore.getState().clear()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
```

---

## Частые ошибки

| Ситуация | Код | Решение |
|----------|-----|---------|
| Access token истёк | `401` | Вызвать `/auth/refresh`, повторить запрос |
| Refresh token в access-контексте | `401` | Использовать access_token для обычных запросов |
| Journal entry за существующую дату | `409` | Использовать `PATCH /journal/entries/{date}` |
| Файл > 5 MB | `413` | Проверить размер перед отправкой |
| Невалидный cron | `422` | Использовать 5-field формат: `"0 9 * * *"` |
| Не передан `firstName` при регистрации | `422` | Обязательное поле |
| Пароль без цифры или заглавной буквы | `422` | Мин 8 символов + 1 цифра + 1 заглавная |
