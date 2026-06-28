# HabitForge — Backend Tasks

Стек: FastAPI + SQLModel + PostgreSQL + Alembic + APScheduler
Все модели наследуют SQLModel, все id — uuid.UUID, все даты — datetime UTC.
Существующие endpoints не ломать — только расширять.

---

## 1. Подзадачи (Subtasks)

### Модель

Добавить поле в существующую модель `Task`:

```python
parent_id: uuid.UUID | None = Field(default=None, foreign_key="tasks.id", index=True)
```

### Миграция

```python
op.add_column('tasks', sa.Column('parent_id', sa.UUID(), nullable=True))
op.create_foreign_key('fk_tasks_parent', 'tasks', 'tasks', ['parent_id'], ['id'], ondelete='CASCADE')
op.create_index('ix_tasks_parent_id', 'tasks', ['parent_id'])
```

### Endpoints

```
GET  /tasks/{id}/subtasks
     → List[Task] где parent_id == id AND user_id == current_user.id
     → order by sort_order asc, created_at asc

POST /tasks/{id}/subtasks
     Body: { "title": str, "priority": int = 2 }
     → создать Task с parent_id = id, user_id = current_user.id
     → вернуть созданный Task
```

### Изменения в существующих endpoints

**GET /tasks/**
- Добавить query-параметр `include_subtasks: bool = False`
- По умолчанию (False) — возвращать только задачи где `parent_id IS NULL`
- Если True — возвращать все задачи включая подзадачи

**TaskResponse** — добавить поля:
```python
subtasks_count: int = 0   # SELECT COUNT(*) WHERE parent_id = task.id
subtasks_done:  int = 0   # WHERE parent_id = task.id AND completed = true
```

---

## 2. Проекты / Списки

### Модель Project (новая таблица)

```python
class Project(SQLModel, table=True):
    id:         uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id:    uuid.UUID = Field(foreign_key="users.id", index=True)
    name:       str
    color:      str       = Field(default="#7c3aed")   # hex
    icon:       str | None = None                      # emoji
    sort_order: int       = Field(default=0, index=True)
    created_at: datetime  = Field(default_factory=datetime.utcnow)
```

### Изменение модели Task

Добавить поле:
```python
project_id: uuid.UUID | None = Field(default=None, foreign_key="projects.id", index=True)
```

Миграция: `ondelete="SET NULL"` — при удалении проекта задачи остаются, project_id → NULL.

### Endpoints /projects

```
GET    /projects/
       → List[Project] где user_id == current_user.id, order by sort_order asc
       → каждый Project включает: tasks_count: int, tasks_done: int

POST   /projects/
       Body: { "name": str, "color": str = "#7c3aed", "icon": str | None }
       → создать Project, вернуть ProjectResponse

PATCH  /projects/{id}
       Body: { "name"?, "color"?, "icon"? }
       → проверить user_id == current_user.id, обновить, вернуть ProjectResponse

DELETE /projects/{id}
       → проверить user_id == current_user.id
       → tasks с project_id = id → project_id = NULL
       → удалить Project

POST   /projects/reorder
       Body: { "ids": ["uuid1", "uuid2", ...] }
       → проставить sort_order = index для каждого project
       → все ids должны принадлежать current_user, иначе 403
       → вернуть { "status": "ok" }
```

### Изменения в GET /tasks/

Добавить query-параметр:
```
project_id: uuid.UUID | None = None
```
Фильтровать по `project_id` если передан.

---

## 3. Теги (Tags)

### Модели (новые таблицы)

```python
class Tag(SQLModel, table=True):
    id:      uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name:    str
    color:   str       = Field(default="#64748b")

class TaskTag(SQLModel, table=True):
    task_id: uuid.UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id:  uuid.UUID = Field(foreign_key="tags.id",  primary_key=True)
```

Миграция: оба FK с `ondelete="CASCADE"`.

### Endpoints /tags

```
GET    /tags/
       → List[Tag] где user_id == current_user.id

POST   /tags/
       Body: { "name": str, "color": str = "#64748b" }
       → создать Tag, вернуть TagResponse

PATCH  /tags/{id}
       Body: { "name"?, "color"? }
       → обновить, вернуть TagResponse

DELETE /tags/{id}
       → удалить Tag (TaskTag удаляются каскадно)
```

### Endpoints /tasks/{id}/tags

```
POST   /tasks/{id}/tags
       Body: { "tag_id": "uuid" }
       → проверить что task принадлежит current_user
       → проверить что tag принадлежит current_user
       → создать TaskTag, вернуть обновлённый Task

DELETE /tasks/{id}/tags/{tag_id}
       → удалить TaskTag запись
       → вернуть обновлённый Task
```

### Изменения в GET /tasks/

Добавить query-параметр:
```
tag_id: uuid.UUID | None = None
```
Фильтровать через `JOIN TaskTag` если передан.

**TaskResponse** — добавить поле:
```python
tags: list[TagResponse] = []   # eager load через subquery
```

---

## 4. Push-уведомления о дедлайнах

### Зависимости

```
pip install pywebpush apscheduler
```

### Переменные окружения (.env)

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CLAIMS_EMAIL=admin@habitforge.app
```

Генерация ключей:
```bash
pip install py-vapid
vapid --gen
```

### Модель PushSubscription (новая таблица)

```python
class PushSubscription(SQLModel, table=True):
    id:        uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id:   uuid.UUID = Field(foreign_key="users.id", index=True)
    endpoint:  str       = Field(unique=True)
    p256dh:    str
    auth:      str
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### Endpoints /push

```
POST /push/subscribe
     Body: {
       "endpoint": str,
       "keys": { "p256dh": str, "auth": str }
     }
     → upsert по endpoint (если уже есть — обновить ключи)
     → вернуть { "status": "ok" }

DELETE /push/subscribe
       Body: { "endpoint": str }
       → удалить подписку по endpoint
       → вернуть { "status": "ok" }

GET /push/vapid-public-key
    → вернуть { "key": VAPID_PUBLIC_KEY }
    → публичный endpoint (без auth)
```

### Фоновая задача (APScheduler)

Запускать каждые 15 минут:

```python
async def send_deadline_reminders():
    # Найти задачи с дедлайном через 30 минут (±5 мин погрешность)
    window_start = datetime.utcnow() + timedelta(minutes=25)
    window_end   = datetime.utcnow() + timedelta(minutes=35)

    tasks = await session.exec(
        select(Task)
        .where(Task.due_date.between(window_start, window_end))
        .where(Task.completed == False)
        .where(Task.parent_id == None)
    )

    for task in tasks:
        subscriptions = await session.exec(
            select(PushSubscription).where(PushSubscription.user_id == task.user_id)
        )
        for sub in subscriptions:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth}
                },
                data=json.dumps({
                    "title": "HabitForge",
                    "body": f"⏰ Задача «{task.title}» через 30 минут",
                    "icon": "/icon.svg"
                }),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{VAPID_CLAIMS_EMAIL}"}
            )
```

---

## 5. Streak-защита (Freeze) для привычек

### Изменение модели Habit

Добавить поля:

```python
freeze_available:  int        = Field(default=1)
freeze_used_dates: list[str]  = Field(default=[], sa_column=Column(JSON))
# даты хранить как ISO строки "YYYY-MM-DD"
```

Миграция:
```python
op.add_column('habits', sa.Column('freeze_available', sa.Integer(), nullable=False, server_default='1'))
op.add_column('habits', sa.Column('freeze_used_dates', postgresql.JSON(), nullable=False, server_default='[]'))
```

### Изменение логики подсчёта streak

При подсчёте streak (функция которая считает consecutive days):
- Если день пропущен И эта дата есть в `freeze_used_dates` → считать как выполненный

### Endpoint

```
POST /habits/{id}/freeze
     Body: { "date": "YYYY-MM-DD" }  — опционально, default: вчера
     → проверить habit.user_id == current_user.id
     → если freeze_available <= 0: 400 { "detail": "No freezes available" }
     → если date уже в freeze_used_dates: 400 { "detail": "Already frozen" }
     → если date — сегодня или будущее: 400 { "detail": "Can only freeze past days" }
     → добавить date в freeze_used_dates
     → freeze_available -= 1
     → вернуть обновлённый HabitResponse
```

### Восстановление заморозок (APScheduler)

Запускать каждый понедельник в 00:01 UTC:

```python
async def restore_habit_freezes():
    # Всем пользователям добавить 1 заморозку, максимум 2
    await session.exec(
        update(Habit)
        .where(Habit.freeze_available < 2)
        .values(freeze_available=Habit.freeze_available + 1)
    )
    await session.commit()
```

---

## Сводка изменений

| # | Что | Новые таблицы | Изменения в существующих |
|---|-----|---------------|--------------------------|
| 1 | Подзадачи | — | tasks: +parent_id |
| 2 | Проекты | projects | tasks: +project_id |
| 3 | Теги | tags, task_tags | tasks response: +tags[] |
| 4 | Push-уведомления | push_subscriptions | — |
| 5 | Streak freeze | — | habits: +freeze_available, +freeze_used_dates |

**Порядок миграций (важно соблюдать):**
1. projects
2. tasks: parent_id, project_id
3. tags, task_tags
4. push_subscriptions
5. habits: freeze поля
