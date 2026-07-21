#!/usr/bin/env node
/**
 * HabitForge — seed script
 * Fills one user's account with realistic test data across ALL modules.
 *
 * Usage:
 *   node scripts/seed-user.mjs --email user@example.com --password Secret123
 *   node scripts/seed-user.mjs --email user@example.com --password Secret123 --url http://localhost:8000
 *   node scripts/seed-user.mjs --email user@example.com --password Secret123 --clean
 *   node scripts/seed-user.mjs --email user@example.com --password Secret123 --register --first-name Алексей
 *
 * Password must contain at least one uppercase letter (backend requirement).
 *
 * Requires Node 18+ (native fetch + getSetCookie).
 */

import { readFileSync } from "fs";

// Load .env.local → .env (same priority as Next.js)
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].replace(/^["']|["']$/g, "");
      }
    }
    break;
  } catch {}
}

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const BASE_URL = getArg("url") ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const EMAIL = getArg("email");
const PASSWORD = getArg("password");
const CLEAN = hasFlag("clean");
const REGISTER = hasFlag("register");
const FIRST_NAME = getArg("first-name") ?? "Тест";

if (!EMAIL || !PASSWORD) {
  console.error("Usage: node scripts/seed-user.mjs --email <email> --password <password> [--url <url>] [--clean] [--register] [--first-name <name>]");
  process.exit(1);
}

// ─── Cookie storage ───────────────────────────────────────────────────────────

let cookieJar = [];

function parseCookies(headerValues) {
  for (const val of headerValues) {
    const name = val.split("=")[0];
    cookieJar = cookieJar.filter((c) => !c.startsWith(name + "="));
    cookieJar.push(val.split(";")[0]);
  }
}

function cookieHeader() {
  return cookieJar.join("; ");
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

let requestCount = 0;

async function req(method, path, body) {
  requestCount++;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieJar.length ? { Cookie: cookieHeader() } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) parseCookies(setCookie);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const get   = (path)        => req("GET", path);
const post  = (path, body)  => req("POST", path, body);
const patch = (path, body)  => req("PATCH", path, body);
const del   = (path)        => req("DELETE", path);
const delSafe = (path)      => del(path).catch(() => null);

// ─── Date helpers ─────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const today = () => new Date().toISOString().split("T")[0];

function pastDates(totalDays, completionRate = 0.8) {
  const dates = [];
  for (let i = 1; i <= totalDays; i++) {
    if (Math.random() < completionRate) dates.push(daysAgo(i));
  }
  return dates;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Progress logger ──────────────────────────────────────────────────────────

function log(emoji, msg) {
  process.stdout.write(`  ${emoji}  ${msg}\n`);
}

function section(title) {
  console.log(`\n${"─".repeat(55)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(55));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function registerAndLogin() {
  section("Регистрация + вход");
  try {
    await post("/auth/register", { email: EMAIL, password: PASSWORD, firstName: FIRST_NAME });
    log("✅", `Аккаунт создан: ${EMAIL}`);
  } catch (e) {
    if (e.message.includes("409") || e.message.includes("already")) {
      log("⚠️ ", "Пользователь уже существует — входим");
    } else {
      throw e;
    }
  }
  await login();
}

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) parseCookies(setCookie);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const user = data.user ?? data;
  console.log(`   ✅ Вошли как: ${user.firstName ?? FIRST_NAME} <${EMAIL}>\n`);
}

// ─── Clean ────────────────────────────────────────────────────────────────────

async function cleanUser() {
  section("Очистка данных пользователя");

  // Shopping lists
  const shoppingLists = await get("/shopping/lists").catch(() => []);
  const shoppingList = Array.isArray(shoppingLists) ? shoppingLists : (shoppingLists.items ?? []);
  for (const s of shoppingList) await delSafe(`/shopping/lists/${s.id}`);
  log("🗑️ ", `Списки покупок: ${shoppingList.length}`);

  // Reminders
  const reminders = await get("/reminders").catch(() => []);
  const reminderList = Array.isArray(reminders) ? reminders : [];
  for (const r of reminderList) await delSafe(`/reminders/${r.id}`);
  log("🗑️ ", `Напоминания: ${reminderList.length}`);

  // Budgets
  const budgets = await get("/finance/budgets").catch(() => []);
  const budgetList = Array.isArray(budgets) ? budgets : [];
  for (const b of budgetList) await delSafe(`/finance/budgets/${b.id}`);
  log("🗑️ ", `Бюджеты: ${budgetList.length}`);

  // Finance transactions
  const txns = await get("/finance/transactions?limit=1000").catch(() => []);
  const txnList = Array.isArray(txns) ? txns : [];
  for (const t of txnList) await delSafe(`/finance/transactions/${t.id}`);
  log("🗑️ ", `Транзакции: ${txnList.length}`);

  // Finance categories
  const cats = await get("/finance/categories").catch(() => []);
  const catList = Array.isArray(cats) ? cats : [];
  for (const c of catList) await delSafe(`/finance/categories/${c.id}`);
  log("🗑️ ", `Категории финансов: ${catList.length}`);

  // Goals (paginated now)
  const goalsRes = await get("/goals?limit=1000").catch(() => ({ items: [] }));
  const goalList = Array.isArray(goalsRes) ? goalsRes : (goalsRes.items ?? []);
  for (const g of goalList) await delSafe(`/goals/${g.id}`);
  log("🗑️ ", `Цели: ${goalList.length}`);

  // Journal entries
  const entries = await get("/journal/entries?limit=1000").catch(() => []);
  const entryList = Array.isArray(entries) ? entries : [];
  for (const e of entryList) await delSafe(`/journal/entries/${String(e.date).split("T")[0]}`);
  log("🗑️ ", `Записи дневника: ${entryList.length}`);

  // Nutrition logs
  const nutLogs = await get("/nutrition/logs?limit=1000").catch(() => []);
  const nutList = Array.isArray(nutLogs) ? nutLogs : [];
  for (const n of nutList) await delSafe(`/nutrition/logs/${n.id}`);
  log("🗑️ ", `Логи питания: ${nutList.length}`);

  // Nutrition plans
  const nutPlans = await get("/nutrition/plans").catch(() => []);
  const nutPlanList = Array.isArray(nutPlans) ? nutPlans : [];
  for (const p of nutPlanList) await delSafe(`/nutrition/plans/${p.id}`);
  log("🗑️ ", `Планы питания: ${nutPlanList.length}`);

  // Workout logs
  const wLogs = await get("/workouts/logs?limit=1000").catch(() => []);
  const wLogList = Array.isArray(wLogs) ? wLogs : [];
  for (const w of wLogList) await delSafe(`/workouts/logs/${w.id}`);
  log("🗑️ ", `Тренировки: ${wLogList.length}`);

  // Workout plans
  const wPlans = await get("/workouts/plans").catch(() => []);
  const wPlanList = Array.isArray(wPlans) ? wPlans : [];
  for (const p of wPlanList) await delSafe(`/workouts/plans/${p.id}`);
  log("🗑️ ", `Планы тренировок: ${wPlanList.length}`);

  // Personal records have no list/delete endpoint — cascade-deleted with exercises

  // Tasks
  const tasksData  = await get("/tasks/?limit=500&completed=false").catch(() => ({ items: [] }));
  const tasksDone  = await get("/tasks/?limit=500&completed=true").catch(() => ({ items: [] }));
  const allTasks   = [...(tasksData.items ?? []), ...(tasksDone.items ?? [])];
  const parents    = allTasks.filter((t) => !t.parentId);
  const children   = allTasks.filter((t) => t.parentId);
  for (const t of parents)  await delSafe(`/tasks/${t.id}`);
  for (const t of children) await delSafe(`/tasks/${t.id}`);
  log("🗑️ ", `Задачи: ${allTasks.length}`);

  // Habits — fetch archived + non-archived separately (backend can't return both at once)
  const habitsActive   = await get("/habits/?limit=500&archived=false").catch(() => ({ items: [] }));
  const habitsArchived = await get("/habits/?limit=500&archived=true").catch(() => ({ items: [] }));
  const habitList = [...(habitsActive.items ?? []), ...(habitsArchived.items ?? [])];
  for (const h of habitList) await delSafe(`/habits/${h.id}`);
  log("🗑️ ", `Привычки: ${habitList.length}`);

  // Projects
  const projects = await get("/projects/").catch(() => []);
  const projectList = Array.isArray(projects) ? projects : [];
  for (const p of projectList) await delSafe(`/projects/${p.id}`);
  log("🗑️ ", `Проекты: ${projectList.length}`);

  // Tags
  const tags = await get("/tags/").catch(() => []);
  const tagList = Array.isArray(tags) ? tags : [];
  for (const t of tagList) await delSafe(`/tags/${t.id}`);
  log("🗑️ ", `Теги: ${tagList.length}`);

  console.log("\n  ✅ Все данные очищены\n");
}

// ─── Seed: Projects ───────────────────────────────────────────────────────────

async function seedProjects() {
  section("Projects");
  const list = [
    { name: "Работа", color: "#7c3aed", icon: "💼" },
    { name: "Личное", color: "#06b6d4", icon: "🏠" },
    { name: "Здоровье", color: "#22c55e", icon: "💪" },
  ];
  const ids = [];
  for (const p of list) {
    const created = await post("/projects/", p);
    ids.push(created.id);
    log("📁", `"${p.name}" (${created.id})`);
  }
  return ids;
}

// ─── Seed: Tags ───────────────────────────────────────────────────────────────

async function seedTags() {
  section("Tags");
  const list = [
    { name: "срочно",   color: "#ef4444" },
    { name: "важное",   color: "#f59e0b" },
    { name: "рутина",   color: "#64748b" },
    { name: "учёба",    color: "#7c3aed" },
    { name: "проект",   color: "#06b6d4" },
  ];
  const ids = [];
  for (const t of list) {
    const created = await post("/tags/", t);
    ids.push(created.id);
    log("🏷️ ", `"${t.name}" (${created.id})`);
  }
  return ids;
}

// ─── Seed: Habits ─────────────────────────────────────────────────────────────

async function seedHabits() {
  section("Habits + logs (45 дней)");
  const habits = [
    { title: "Медитация",        icon: "🧘", color: "#7c3aed", frequency: "daily", rate: 0.82 },
    { title: "Чтение 30 мин",    icon: "📚", color: "#06b6d4", frequency: "daily", rate: 0.72 },
    { title: "Спорт/тренировка", icon: "💪", color: "#22c55e", frequency: "daily", rate: 0.58 },
    { title: "Пить воду 2л",     icon: "💧", color: "#0ea5e9", frequency: "daily", rate: 0.91 },
    { title: "Ранний подъём",    icon: "🌅", color: "#f59e0b", frequency: "daily", rate: 0.65 },
  ];

  const ids = [];
  for (const { rate, ...habit } of habits) {
    const created = await post("/habits/", habit);
    ids.push(created.id);
    const dates = pastDates(45, rate);
    if (dates.length) await post(`/habits/${created.id}/logs/bulk`, { dates });
    // Today's completion for some habits
    if (rate > 0.7) {
      await post(`/habits/${created.id}/logs/bulk`, { dates: [today()] }).catch(() => null);
    }
    log("✅", `"${habit.title}" — ${dates.length} отметок за 45 дней`);
  }
  return ids;
}

// ─── Seed: Tasks ──────────────────────────────────────────────────────────────

async function seedTasks(projectIds, tagIds) {
  section("Tasks + subtasks + comments");
  const [workId, personalId, healthId] = projectIds;
  const [urgentId, importantId, routineId, studyId, projectTagId] = tagIds;

  const tasks = [
    {
      title: "Исправить критический баг в авторизации",
      priority: 1, status: "in_progress",
      dueDate: daysAgo(2), projectId: workId, tags: [urgentId, importantId],
      description: "Пользователи не могут войти через OAuth. Нужно проверить redirect URL.",
      estimatedMinutes: 120,
      comments: [
        "Воспроизвёл баг — проблема в redirect_uri при работе через proxy",
        "Нашёл коммит через git bisect — проблема появилась 3 дня назад",
        "Исправил, жду review от Дениса",
      ],
      subtasks: [
        "Воспроизвести баг в dev-окружении",
        "Найти проблемный коммит через git bisect",
        "Исправить redirect URL в OAuth конфиге",
        "Написать regression-тест",
      ],
    },
    {
      title: "Настроить CI/CD для продакшн-деплоя",
      priority: 1, status: "done",
      dueDate: daysAgo(5), projectId: workId, tags: [projectTagId],
      estimatedMinutes: 180,
      subtasks: [
        "Настроить GitHub Actions workflow",
        "Добавить деплой на staging",
        "Настроить Slack-уведомления",
      ],
    },
    {
      title: "Написать документацию для REST API",
      priority: 1, status: "review",
      dueDate: daysFromNow(3), projectId: workId, tags: [importantId, projectTagId],
      description: "Swagger + Postman коллекция для всех эндпоинтов.",
      estimatedMinutes: 240,
      comments: ["Черновик готов, прошу проверить разделы Auth и Tasks"],
    },
    {
      title: "Обновить зависимости проекта",
      priority: 2, status: "done",
      dueDate: daysAgo(10), projectId: workId, tags: [routineId],
    },
    {
      title: "Написать unit-тесты для модуля аутентификации",
      priority: 2, status: "done",
      dueDate: daysAgo(3), projectId: workId, tags: [importantId],
      estimatedMinutes: 90,
    },
    {
      title: "Встреча с командой — планирование квартала",
      priority: 2, status: "todo",
      dueDate: today(), projectId: workId, tags: [urgentId],
    },
    {
      title: "Добавить тёмную тему в мобильное приложение",
      priority: 2, status: "todo",
      dueDate: daysFromNow(7), projectId: workId, tags: [projectTagId],
      estimatedMinutes: 300,
    },
    {
      title: "Прочитать книгу «Clean Architecture»",
      priority: 2, status: "in_progress",
      dueDate: daysFromNow(14), projectId: personalId, tags: [studyId],
      description: "Глава 5–12. Конспект основных принципов.",
    },
    {
      title: "Записаться к стоматологу",
      priority: 2, status: "todo",
      dueDate: daysFromNow(5), projectId: healthId, tags: [importantId],
    },
    {
      title: "Обновить профиль на LinkedIn",
      priority: 3, status: "done",
      projectId: personalId, tags: [],
    },
    {
      title: "Купить новые кроссовки для бега",
      priority: 3, status: "todo",
      dueDate: daysFromNow(10), projectId: healthId, tags: [],
    },
    {
      title: "Разобрать почту и архивировать старые письма",
      priority: 3, status: "todo",
      projectId: personalId, tags: [routineId],
    },
    {
      title: "Почитать про GraphQL subscriptions",
      priority: 3, status: "todo",
      dueDate: daysFromNow(20), projectId: workId, tags: [studyId],
    },
    {
      title: "Рефакторинг модуля уведомлений",
      priority: 2, status: "review",
      dueDate: daysFromNow(4), projectId: workId, tags: [projectTagId],
      estimatedMinutes: 150,
      comments: ["Убрал 3 уровня вложенности, покрыл тестами"],
    },
    {
      title: "Купить продукты на неделю",
      priority: 2, status: "todo",
      dueDate: today(), projectId: personalId, tags: [routineId],
    },
    {
      title: "Сделать анализы крови",
      priority: 1, status: "todo",
      dueDate: daysFromNow(7), projectId: healthId, tags: [importantId],
    },
  ];

  const createdTasks = [];
  for (const { tags, subtasks, comments, ...task } of tasks) {
    const created = await post("/tasks/", {
      title: task.title,
      description: task.description ?? null,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ?? null,
      projectId: task.projectId ?? null,
      estimatedMinutes: task.estimatedMinutes ?? null,
      completed: task.status === "done",
    });

    for (const tagId of (tags ?? [])) {
      await post(`/tasks/${created.id}/tags/${tagId}`).catch(() => null);
    }

    for (const title of (subtasks ?? [])) {
      await post(`/tasks/${created.id}/subtasks`, { title, priority: task.priority }).catch(() => null);
    }

    for (const body of (comments ?? [])) {
      await post(`/tasks/${created.id}/comments`, { body }).catch(() => null);
    }

    createdTasks.push(created);
    const statusIcon = { done: "✓", in_progress: "▶", review: "👀", todo: " ", cancelled: "✗" }[task.status] ?? " ";
    log("📝", `[${statusIcon}] "${task.title}" [P${task.priority}]`);
  }

  log("💬", `Комментарии добавлены к задачам`);
  return createdTasks;
}

// ─── Seed: Workouts ───────────────────────────────────────────────────────────

async function seedWorkouts() {
  section("Workouts — планы, сессии, библиотека, рекорды");

  const plan = await post("/workouts/plans", {
    name: "Силовая программа Push/Pull/Legs",
    description: "3 дня в неделю — Push, Pull, Legs по кругу",
    daysPerWeek: 3,
  });
  log("📋", `План "${plan.name}"`);

  const planExercises = [
    { name: "Жим лёжа",              muscleGroup: "Грудь",        sets: 4, repsPerSet: 8,  weightKg: 80  },
    { name: "Приседания со штангой",  muscleGroup: "Ноги",         sets: 4, repsPerSet: 6,  weightKg: 100 },
    { name: "Становая тяга",          muscleGroup: "Спина",        sets: 3, repsPerSet: 5,  weightKg: 120 },
    { name: "Подтягивания",           muscleGroup: "Спина/Бицепс", sets: 4, repsPerSet: 10, weightKg: null },
    { name: "Жим гантелей сидя",      muscleGroup: "Плечи",        sets: 3, repsPerSet: 12, weightKg: 22  },
    { name: "Отжимания на брусьях",   muscleGroup: "Грудь/Трицепс",sets: 3, repsPerSet: 12, weightKg: null },
  ];
  for (const ex of planExercises) {
    await post(`/workouts/plans/${plan.id}/exercises`, ex);
  }
  log("🏋️ ", `${planExercises.length} упражнений в план`);

  // Workout logs
  const workoutDays = [1, 3, 6, 8, 10, 13, 15, 17, 20, 22, 24, 27, 29];
  const durations   = [55, 62, 48, 70, 58, 65, 50, 72, 60, 55, 68, 50, 63];
  const notesPool   = [
    "Отличная тренировка, поставил PR в жиме!",
    "Немного устал, но завершил все сеты",
    "Лёгкая тренировка после болезни",
    "Плечи ещё побаливают, снизил вес",
    "Хорошая скорость восстановления",
    null,
  ];

  for (let i = 0; i < workoutDays.length; i++) {
    const logEntry = await post("/workouts/logs", {
      planId: plan.id,
      date: daysAgo(workoutDays[i]),
      durationMinutes: durations[i],
      notes: notesPool[i % notesPool.length],
    });
    for (const ex of planExercises.slice(0, 4)) {
      await post(`/workouts/logs/${logEntry.id}/exercises`, {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets,
        repsPerSet: ex.repsPerSet,
        weightKg: ex.weightKg ? ex.weightKg + Math.floor(Math.random() * 5 - 2) : null,
      });
    }
    log("💪", `Тренировка ${daysAgo(workoutDays[i])} — ${durations[i]} мин`);
  }

  // Exercise library — collect IDs for personal records
  const libraryDefs = [
    { name: "Жим лёжа",              muscleGroup: "chest",     equipment: "barbell",     description: "Классический жим штанги лёжа на горизонтальной скамье" },
    { name: "Приседания",             muscleGroup: "legs",      equipment: "barbell",     description: "Приседания со штангой на спине" },
    { name: "Становая тяга",          muscleGroup: "back",      equipment: "barbell",     description: "Классическая становая тяга" },
    { name: "Подтягивания",           muscleGroup: "back",      equipment: "bodyweight",  description: "Подтягивания на перекладине широким хватом" },
    { name: "Жим стоя",               muscleGroup: "shoulders", equipment: "barbell",     description: "Жим штанги над головой стоя" },
    { name: "Тяга верхнего блока",    muscleGroup: "back",      equipment: "cable",       description: "Тяга блока к груди широким хватом" },
    { name: "Жим гантелей на наклон", muscleGroup: "chest",     equipment: "dumbbell",    description: "Жим гантелей на наклонной скамье 30°" },
    { name: "Разгибания ног",         muscleGroup: "legs",      equipment: "machine",     description: "Разгибания ног в тренажёре сидя" },
    { name: "Скручивания",            muscleGroup: "core",      equipment: "bodyweight",  description: "Скручивания на пресс лёжа на полу" },
    { name: "Бёрпи",                  muscleGroup: "full_body", equipment: "bodyweight",  description: "Комплексное кардио-упражнение" },
  ];
  const libraryIds = {};
  for (const ex of libraryDefs) {
    const created = await post("/workouts/exercises/library", ex).catch(() => null);
    if (created?.id) libraryIds[ex.name] = created.id;
  }
  log("📚", `${libraryDefs.length} упражнений добавлено в библиотеку`);

  // Personal records — requires exercise_id in path
  const recordDefs = [
    { exerciseName: "Жим лёжа",     recordType: "max_weight", value: 85,   unit: "кг",      achievedAt: daysAgo(4),  notes: "Личный рекорд! Форма отличная" },
    { exerciseName: "Приседания",   recordType: "max_weight", value: 105,  unit: "кг",      achievedAt: daysAgo(10), notes: null },
    { exerciseName: "Становая тяга",recordType: "max_weight", value: 125,  unit: "кг",      achievedAt: daysAgo(17), notes: "Обновил рекорд на 5 кг" },
    { exerciseName: "Подтягивания", recordType: "max_reps",   value: 18,   unit: "раз",     achievedAt: daysAgo(6),  notes: null },
    { exerciseName: "Жим лёжа",     recordType: "max_volume", value: 2720, unit: "кг·повт", achievedAt: daysAgo(4),  notes: "4×8 @ 85 кг" },
  ];
  let recordsAdded = 0;
  for (const { exerciseName, ...rec } of recordDefs) {
    const exId = libraryIds[exerciseName];
    if (!exId) continue;
    await post(`/workouts/exercises/${exId}/records`, rec).catch(() => null);
    recordsAdded++;
  }
  log("🏆", `${recordsAdded} личных рекордов добавлено`);
}

// ─── Seed: Nutrition ──────────────────────────────────────────────────────────

async function seedNutrition() {
  section("Nutrition — план, 14 дней логов");

  const plan = await post("/nutrition/plans", {
    name: "Набор мышечной массы",
    description: "Профицит 300 ккал, высокий белок",
    targetCalories: 2800,
    targetProtein: 180,
    targetCarbs: 320,
    targetFat: 80,
  });
  log("🥗", `Plan: "${plan.name}"`);

  // Meal templates
  const templates = [
    { mealType: "breakfast", name: "Овсянка с яйцами",        calories: 450, protein: 28, carbs: 55, fat: 12 },
    { mealType: "lunch",     name: "Курица с рисом",           calories: 560, protein: 48, carbs: 55, fat: 10 },
    { mealType: "snack",     name: "Творог + протеин",         calories: 280, protein: 35, carbs: 15, fat: 5  },
    { mealType: "dinner",    name: "Рыба с овощами на пару",   calories: 420, protein: 42, carbs: 22, fat: 14 },
  ];
  for (const t of templates) {
    await post(`/nutrition/plans/${plan.id}/meals`, t).catch(() => null);
  }
  log("📋", `${templates.length} шаблона приёмов добавлено`);

  const meals = {
    breakfast: [
      { name: "Овсяная каша с бананом", calories: 380, protein: 14, carbs: 65, fat: 7 },
      { name: "Яичница (3 яйца) с тостами", calories: 420, protein: 24, carbs: 35, fat: 22 },
      { name: "Протеиновый смузи", calories: 310, protein: 32, carbs: 28, fat: 6 },
    ],
    lunch: [
      { name: "Куриная грудка с рисом и овощами", calories: 560, protein: 48, carbs: 55, fat: 10 },
      { name: "Говяжья котлета с гречкой", calories: 620, protein: 42, carbs: 60, fat: 18 },
      { name: "Лосось с запечёнными овощами", calories: 490, protein: 44, carbs: 30, fat: 18 },
    ],
    snack: [
      { name: "Творог 5% с ягодами", calories: 220, protein: 24, carbs: 18, fat: 5 },
      { name: "Протеиновый батончик", calories: 200, protein: 20, carbs: 22, fat: 5 },
      { name: "Орехи + яблоко", calories: 280, protein: 7, carbs: 35, fat: 16 },
    ],
    dinner: [
      { name: "Стейк из говядины с салатом", calories: 520, protein: 48, carbs: 15, fat: 28 },
      { name: "Запечённая курица с картофелем", calories: 480, protein: 40, carbs: 42, fat: 14 },
      { name: "Тунец с брокколи", calories: 360, protein: 42, carbs: 20, fat: 8 },
    ],
  };

  for (let day = 1; day <= 14; day++) {
    const date = daysAgo(day);
    for (const mealType of ["breakfast", "lunch", "snack", "dinner"]) {
      const options = meals[mealType];
      await post("/nutrition/logs", { ...options[day % options.length], date, mealType, notes: null });
    }
    log("🍽️ ", `${date} — 4 приёма пищи`);
  }
}

// ─── Seed: Journal ────────────────────────────────────────────────────────────

async function seedJournal() {
  section("Journal (21 день)");

  // Fields per backend schema: mood, notes, gratitude, intentions
  const entries = [
    { mood: 5, notes: "Прекрасный день! Завершил все задачи, сходил на тренировку, вечером читал книгу.", gratitude: "Закрыл 5 задач, пробежал 5 км", intentions: "Меньше времени в телефоне перед сном" },
    { mood: 4, notes: "Хороший рабочий день. Встреча с командой прошла продуктивно.", gratitude: "Провёл успешную встречу, написал документацию", intentions: "Больше пить воды" },
    { mood: 3, notes: "Сложный день — много дедлайнов. Не успел сходить на тренировку.", gratitude: "Медитация помогла снять стресс", intentions: "Лучше планировать время для спорта" },
    { mood: 4, notes: "Выспался впервые за неделю! Тренировка была огонь — поставил личный рекорд в жиме.", gratitude: "Личный рекорд: жим лёжа 85 кг × 8", intentions: null },
    { mood: 5, notes: "Выходной — провёл время с семьёй, прогулка в парке 2 часа.", gratitude: "Прогулка 2 часа, настольные игры с близкими", intentions: null },
    { mood: 4, notes: "Начало недели немного тяжёлое. Зато дочитал раздел по архитектуре.", gratitude: "Прочитал 40 страниц Clean Architecture", intentions: "Ложиться спать до 23:00" },
    { mood: 3, notes: "Не выспался из-за срочного бага в проде. Весь день на кофе.", gratitude: "Починил критический баг за 3 часа", intentions: "Не брать задачи после 20:00" },
    { mood: 4, notes: "Восстановился. Тренировка и медитация сделали своё дело.", gratitude: "Силовая тренировка, 20 мин медитации", intentions: null },
    { mood: 5, notes: "Отличная среда! Завершил все задачи к 16:00.", gratitude: "Курс по TypeScript — 3 модуля", intentions: "Добавить растяжку после тренировки" },
    { mood: 4, notes: "Продуктивный день, хотя немного отвлекался на соцсети.", gratitude: "Code review 8 PR, помог коллеге с дебагом", intentions: "Использовать Pomodoro" },
    { mood: 3, notes: "Средний день. Нужно ставить более конкретные цели.", gratitude: "Не пропустил тренировку", intentions: "Планировать вечер заранее" },
    { mood: 5, notes: "Лучший день месяца! Завершил большой фича-релиз, команда довольна.", gratitude: "Релиз v2.0, командный ужин", intentions: null },
    { mood: 4, notes: "Плавный день после релиза. Разгреб накопившиеся задачи.", gratitude: "Закрыл 12 задач в бэклоге", intentions: null },
    { mood: 4, notes: "Начал неделю с планирования. Расставил приоритеты на месяц.", gratitude: "Составил roadmap на Q3", intentions: "Добавить больше овощей" },
    { mood: 5, notes: "Вышел пораньше и погулял час перед работой. Очень помогает с концентрацией.", gratitude: "Утренняя прогулка + фокусная работа 4 часа", intentions: null },
    { mood: 4, notes: "Снова поставил рекорд на тренировке. Прогресс налицо!", gratitude: "Становая тяга 125 кг", intentions: null },
    { mood: 3, notes: "Поздно лёг, плохо работал весь день. Урок — беречь режим.", gratitude: "Всё же выполнил ключевые задачи", intentions: "Режим сна — святое" },
    { mood: 4, notes: "Провёл ревью архитектуры с командой. Хороший диалог.", gratitude: "Архитектурный ревью, 2 PR смержены", intentions: null },
    { mood: 5, notes: "Субботний день отдыха. Прогулка, книга, хороший сон.", gratitude: "Прочитал 60 страниц, прогулка 3 км", intentions: null },
    { mood: 4, notes: "Понедельник. Чуть тяжело, но раскачался.", gratitude: "Медитация утром, закрыл 4 задачи", intentions: "Кофе только до 14:00" },
    { mood: 4, notes: "Хороший рабочий день. Поел правильно, сходил на тренировку.", gratitude: "Все привычки выполнены", intentions: null },
  ];

  for (let i = 0; i < entries.length; i++) {
    const date = daysAgo(i + 1);
    const payload = { ...entries[i], date };
    try {
      await post("/journal/entries", payload);
    } catch (e) {
      if (e.message.includes("409")) {
        await patch(`/journal/entries/${date}`, payload).catch(() => null);
      } else {
        log("⚠️ ", `Пропущено ${date}: ${e.message.slice(0, 60)}`);
      }
    }
    log("📓", `${date} — настроение ${entries[i].mood}/5`);
  }
}

// ─── Seed: Goals ──────────────────────────────────────────────────────────────

async function seedGoals() {
  section("Goals + progress history");

  const goals = [
    {
      title: "Прочитать 12 книг за год",
      description: "По одной книге в месяц — художественные и профессиональные",
      category: "learning", targetValue: 12, currentValue: 5, unit: "книги",
      color: "#7c3aed", icon: "📚", dueDate: `${new Date().getFullYear()}-12-31`,
      progressHistory: [
        { value: 1, note: "«Чистый код» Роберт Мартин", daysBack: 90 },
        { value: 2, note: "«Атлант расправил плечи»", daysBack: 70 },
        { value: 3, note: "«Думай медленно, решай быстро»", daysBack: 50 },
        { value: 4, note: "«Clean Architecture»", daysBack: 30 },
        { value: 5, note: "«Sapiens. Краткая история человечества»", daysBack: 10 },
      ],
    },
    {
      title: "Пробежать 500 км за год",
      description: "Постепенно наращивать дистанцию, цель — полумарафон к ноябрю",
      category: "fitness", targetValue: 500, currentValue: 127, unit: "км",
      color: "#22c55e", icon: "🏃", dueDate: `${new Date().getFullYear()}-12-31`,
      progressHistory: [
        { value: 28,  note: "Январь: восстановление после болезни", daysBack: 150 },
        { value: 55,  note: "Февраль: вышел на режим 3 пробежки/неделю", daysBack: 120 },
        { value: 82,  note: "Март: первый 10 км забег", daysBack: 90 },
        { value: 105, note: "Апрель: неделя без бега из-за колена", daysBack: 60 },
        { value: 127, note: "Май: новая техника бега, меньше болей", daysBack: 14 },
      ],
    },
    {
      title: "Накопить 100 000 рублей",
      description: "Финансовая подушка на 3 месяца",
      category: "finance", targetValue: 100000, currentValue: 42500, unit: "руб",
      color: "#f59e0b", icon: "💰", dueDate: daysFromNow(120),
      progressHistory: [
        { value: 10000, note: "Первый взнос", daysBack: 90 },
        { value: 22000, note: "Ноябрь — откладываю 10% зарплаты", daysBack: 60 },
        { value: 35000, note: "Доход с фриланса", daysBack: 30 },
        { value: 42500, note: "Регулярный взнос", daysBack: 7 },
      ],
    },
    {
      title: "Подтянуться 20 раз подряд",
      description: "Отслеживаю максимальное количество в одном подходе",
      category: "fitness", targetValue: 20, currentValue: 14, unit: "раз",
      color: "#06b6d4", icon: "💪", dueDate: daysFromNow(60),
      progressHistory: [
        { value: 8,  note: "Стартовый тест", daysBack: 40 },
        { value: 10, note: "Прогресс после 2 недель тренировок", daysBack: 28 },
        { value: 12, note: "Добавил негативы и австралийские", daysBack: 16 },
        { value: 14, note: "Новый рекорд!", daysBack: 4 },
      ],
    },
    {
      title: "Выучить TypeScript на продвинутом уровне",
      description: "Generic types, utility types, conditional types, decorators",
      category: "learning", targetValue: 100, currentValue: 68, unit: "%",
      color: "#8b5cf6", icon: "⌨️", dueDate: daysFromNow(45),
      progressHistory: [
        { value: 15, note: "Основы: базовые типы и интерфейсы", daysBack: 60 },
        { value: 30, note: "Generic types — пройдено", daysBack: 45 },
        { value: 50, note: "Utility types: Partial, Pick, Omit, Record", daysBack: 30 },
        { value: 68, note: "Conditional types и infer", daysBack: 10 },
      ],
    },
  ];

  for (const { progressHistory, ...goal } of goals) {
    const created = await post("/goals", goal);
    log("🎯", `"${goal.title}" — ${goal.currentValue}/${goal.targetValue} ${goal.unit}`);

    // Add progress timeline
    for (const p of (progressHistory ?? [])) {
      // The API logs progress as "new value", not delta
      await post(`/goals/${created.id}/progress`, {
        value: p.value,
        note: p.note,
      }).catch(() => null);
    }
    if (progressHistory?.length) {
      log("  📈", `${progressHistory.length} записей прогресса`);
    }
  }
}

// ─── Seed: Finance ────────────────────────────────────────────────────────────

async function seedFinance() {
  section("Finance — категории, транзакции, бюджеты");

  const categories = [
    { name: "Зарплата",           icon: "💰", color: "#22c55e" },
    { name: "Еда",                icon: "🛒", color: "#f59e0b" },
    { name: "Транспорт",          icon: "🚗", color: "#06b6d4" },
    { name: "Развлечения",        icon: "🎬", color: "#7c3aed" },
    { name: "Здоровье",           icon: "💊", color: "#ef4444" },
    { name: "Обучение",           icon: "📚", color: "#8b5cf6" },
    { name: "Коммунальные услуги", icon: "🏠", color: "#64748b" },
  ];

  const catIds = {};
  for (const cat of categories) {
    const created = await post("/finance/categories", cat);
    catIds[cat.name] = created.id;
    log("🗂️ ", `Категория "${cat.name}"`);
  }

  // Income
  await post("/finance/transactions", { type: "income", amount: 180000, date: daysAgo(62), description: "Зарплата за май", categoryId: catIds["Зарплата"] });
  await post("/finance/transactions", { type: "income", amount: 185000, date: daysAgo(32), description: "Зарплата за июнь", categoryId: catIds["Зарплата"] });
  await post("/finance/transactions", { type: "income", amount: 45000,  date: daysAgo(15), description: "Фриланс — лендинг", categoryId: catIds["Зарплата"] });
  await post("/finance/transactions", { type: "income", amount: 187000, date: daysAgo(2),  description: "Зарплата за июль", categoryId: catIds["Зарплата"] });
  log("💸", "4 дохода добавлено");

  const expenses = [
    { desc: "Продукты Пятёрочка",     cat: "Еда",                 amount: 3200, day: 1  },
    { desc: "Кофе и обед",            cat: "Еда",                 amount: 650,  day: 2  },
    { desc: "Заправка автомобиля",    cat: "Транспорт",           amount: 4500, day: 3  },
    { desc: "Кино + попкорн",         cat: "Развлечения",         amount: 1200, day: 4  },
    { desc: "Продукты Ашан",          cat: "Еда",                 amount: 5800, day: 5  },
    { desc: "Аптека — витамины",      cat: "Здоровье",            amount: 1800, day: 6  },
    { desc: "Курс по TypeScript",     cat: "Обучение",            amount: 4900, day: 7  },
    { desc: "Такси",                  cat: "Транспорт",           amount: 380,  day: 8  },
    { desc: "Ресторан с друзьями",    cat: "Развлечения",         amount: 3200, day: 9  },
    { desc: "Продукты",               cat: "Еда",                 amount: 2900, day: 10 },
    { desc: "Коммуналка июнь",        cat: "Коммунальные услуги", amount: 6200, day: 11 },
    { desc: "Спортпит + протеин",     cat: "Здоровье",            amount: 3600, day: 12 },
    { desc: "Обед в кафе",            cat: "Еда",                 amount: 780,  day: 13 },
    { desc: "Parking + бензин",       cat: "Транспорт",           amount: 1200, day: 14 },
    { desc: "Netflix + Spotify",      cat: "Развлечения",         amount: 799,  day: 15 },
    { desc: "Продукты доставка",      cat: "Еда",                 amount: 4100, day: 16 },
    { desc: "Врач — плановый осмотр", cat: "Здоровье",            amount: 2500, day: 18 },
    { desc: "Такси в аэропорт",       cat: "Транспорт",           amount: 1800, day: 20 },
    { desc: "Книги + канцтовары",     cat: "Обучение",            amount: 1450, day: 22 },
    { desc: "Продукты выходного дня", cat: "Еда",                 amount: 6200, day: 24 },
    { desc: "Коммуналка июль",        cat: "Коммунальные услуги", amount: 6500, day: 25 },
    { desc: "Подарок коллеге",        cat: "Развлечения",         amount: 2800, day: 26 },
    { desc: "Кофе/ланч на неделю",    cat: "Еда",                 amount: 2200, day: 28 },
    { desc: "Абонемент в зал",        cat: "Здоровье",            amount: 3500, day: 30 },
    { desc: "Стоматолог",             cat: "Здоровье",            amount: 4800, day: 35 },
    { desc: "Курс английского",       cat: "Обучение",            amount: 8000, day: 40 },
    { desc: "Продукты месячная закупка", cat: "Еда",              amount: 9500, day: 42 },
    { desc: "Каршеринг",              cat: "Транспорт",           amount: 950,  day: 45 },
  ];

  for (const e of expenses) {
    await post("/finance/transactions", {
      type: "expense", amount: e.amount, date: daysAgo(e.day),
      description: e.desc, categoryId: catIds[e.cat],
    });
  }
  log("📊", `${expenses.length} расходных транзакций добавлено`);

  // Budgets
  const budgets = [
    { name: "Еда на месяц",          amount: 25000, period: "monthly", categoryId: catIds["Еда"],                startDate: daysAgo(30) },
    { name: "Транспорт",             amount: 8000,  period: "monthly", categoryId: catIds["Транспорт"],           startDate: daysAgo(30) },
    { name: "Развлечения",           amount: 10000, period: "monthly", categoryId: catIds["Развлечения"],        startDate: daysAgo(30) },
    { name: "Здоровье",              amount: 15000, period: "monthly", categoryId: catIds["Здоровье"],            startDate: daysAgo(30) },
    { name: "Обучение",              amount: 12000, period: "monthly", categoryId: catIds["Обучение"],            startDate: daysAgo(30) },
  ];
  for (const b of budgets) {
    await post("/finance/budgets", b).catch(() => null);
  }
  log("📈", `${budgets.length} бюджетов добавлено`);
}

// ─── Seed: Shopping ───────────────────────────────────────────────────────────

async function seedShopping() {
  section("Shopping — 3 списка покупок");

  const lists = [
    {
      name: "Еженедельные продукты",
      store: "Пятёрочка",
      plannedDate: today(),
      status: "active",
      notes: "Закупка на неделю",
      items: [
        { name: "Куриная грудка",     quantity: 2,  unit: "кг",  plannedPrice: 420  },
        { name: "Рис длиннозёрный",   quantity: 1,  unit: "кг",  plannedPrice: 85   },
        { name: "Гречка",             quantity: 1,  unit: "кг",  plannedPrice: 95   },
        { name: "Яйца 10 шт",         quantity: 2,  unit: "упак",plannedPrice: 110  },
        { name: "Творог 5% 250г",     quantity: 4,  unit: "шт",  plannedPrice: 78   },
        { name: "Молоко 1л",          quantity: 3,  unit: "шт",  plannedPrice: 95   },
        { name: "Овощи (микс)",       quantity: 1,  unit: "кг",  plannedPrice: 150  },
        { name: "Бананы",             quantity: 1,  unit: "кг",  plannedPrice: 65   },
        { name: "Протеиновый батончик Sporter", quantity: 5, unit: "шт", plannedPrice: 160 },
      ],
    },
    {
      name: "Спортивное питание",
      store: "Спортмастер",
      plannedDate: daysFromNow(3),
      status: "active",
      notes: "Запасы на месяц",
      items: [
        { name: "Протеин Whey 900г",  quantity: 1, unit: "шт", plannedPrice: 2490 },
        { name: "Креатин моногидрат", quantity: 1, unit: "шт", plannedPrice: 890  },
        { name: "Омега-3",            quantity: 1, unit: "шт", plannedPrice: 650  },
        { name: "Витамин D3",         quantity: 1, unit: "шт", plannedPrice: 420  },
        { name: "BCAA 200г",          quantity: 1, unit: "шт", plannedPrice: 760  },
      ],
    },
    {
      name: "Покупки июня",
      store: "ТЦ Мега",
      plannedDate: daysAgo(5),
      status: "completed",
      notes: null,
      items: [
        { name: "Кроссовки Nike Run", quantity: 1, unit: "пар", plannedPrice: 8990, actualPrice: 8990, checked: true },
        { name: "Спортивные носки",   quantity: 3, unit: "пар", plannedPrice: 290,  actualPrice: 290,  checked: true },
        { name: "Бутылка для воды",   quantity: 1, unit: "шт",  plannedPrice: 650,  actualPrice: 590,  checked: true },
        { name: "Резинки для подтягиваний", quantity: 1, unit: "набор", plannedPrice: 1200, actualPrice: 1100, checked: true },
      ],
    },
  ];

  for (const { items, ...listData } of lists) {
    const created = await post("/shopping/lists", {
      name: listData.name,
      store: listData.store ?? null,
      plannedDate: listData.plannedDate ?? null,
      notes: listData.notes ?? null,
    });

    for (const item of items) {
      const createdItem = await post(`/shopping/lists/${created.id}/items`, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? null,
        plannedPrice: item.plannedPrice ?? null,
      });

      if (item.checked) {
        await patch(`/shopping/lists/${created.id}/items/${createdItem.id}`, {
          checked: true,
          actualPrice: item.actualPrice ?? null,
        }).catch(() => null);
      }
    }

    if (listData.status === "completed") {
      await patch(`/shopping/lists/${created.id}`, { status: "completed" }).catch(() => null);
    }

    log("🛒", `"${listData.name}" — ${items.length} товаров [${listData.status}]`);
  }
}

// ─── Seed: Reminders ──────────────────────────────────────────────────────────

async function seedReminders() {
  section("Reminders — 6 напоминаний");

  const reminders = [
    {
      title: "Встреча с командой",
      remindAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      recurrence: "weekly",
      recurrenceTime: "10:00",
      daysOfWeek: [1], // понедельник
    },
    {
      title: "Принять витамины",
      remindAt: new Date().toISOString().split("T")[0] + "T08:30:00",
      recurrence: "daily",
      recurrenceTime: "08:30",
      daysOfWeek: null,
    },
    {
      title: "Медитация перед сном",
      remindAt: new Date().toISOString().split("T")[0] + "T22:00:00",
      recurrence: "daily",
      recurrenceTime: "22:00",
      daysOfWeek: null,
    },
    {
      title: "Тренировка в зале",
      remindAt: new Date().toISOString().split("T")[0] + "T18:00:00",
      recurrence: "weekly",
      recurrenceTime: "18:00",
      daysOfWeek: [1, 3, 5], // пн, ср, пт
    },
    {
      title: "Записаться к стоматологу",
      remindAt: daysFromNow(1) + "T10:00:00",
      recurrence: "once",
      recurrenceTime: null,
      daysOfWeek: null,
    },
    {
      title: "Еженедельный обзор целей",
      remindAt: new Date().toISOString().split("T")[0] + "T20:00:00",
      recurrence: "weekly",
      recurrenceTime: "20:00",
      daysOfWeek: [0], // воскресенье
    },
  ];

  for (const reminder of reminders) {
    await post("/reminders", reminder).catch(() => null);
    log("🔔", `"${reminder.title}" — ${reminder.recurrence}`);
  }
}

// ─── Seed: XP recalculate ─────────────────────────────────────────────────────

async function recalculateXP() {
  section("XP — пересчёт");
  try {
    const res = await post("/users/me/xp/recalculate");
    log("⭐", res?.message ?? "XP пересчёт инициирован (фоновая задача)");
  } catch (e) {
    log("⚠️ ", `XP recalculate пропущен: ${e.message.slice(0, 80)}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 HabitForge Seed Script v2");
  console.log(`   API:  ${BASE_URL}`);
  console.log(`   User: ${EMAIL}`);
  if (REGISTER) console.log("   Mode: --register (создать аккаунт)");
  if (CLEAN)    console.log("   Mode: --clean (очистка перед заполнением)");

  // Auth
  if (REGISTER) {
    await registerAndLogin();
  } else {
    console.log("🔐 Авторизация...");
    try {
      await login();
    } catch (e) {
      console.error("❌ Ошибка входа:", e.message);
      process.exit(1);
    }
  }

  const start = Date.now();

  try {
    if (CLEAN) await cleanUser();

    const projectIds = await seedProjects();
    const tagIds     = await seedTags();
    await seedHabits();
    await seedTasks(projectIds, tagIds);
    await seedWorkouts();
    await seedNutrition();
    await seedJournal();
    await seedGoals();
    await seedFinance();
    await seedShopping();
    await seedReminders();
    await recalculateXP();
  } catch (e) {
    console.error(`\n❌ Ошибка: ${e.message}`);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(55));
  console.log(`  ✅ Готово! ${requestCount} запросов за ${elapsed}с`);
  console.log("═".repeat(55));
  console.log("\n  Заполнено:");
  console.log("    📁  3 проекта");
  console.log("    🏷️   5 тегов");
  console.log("    ✅  5 привычек + ~45 дней логов");
  console.log("    📝  16 задач (статусы, подзадачи, теги, комментарии)");
  console.log("    💪  1 план тренировок + 13 сессий + библиотека + рекорды");
  console.log("    🍽️   14 дней питания (4 приёма/день) + шаблоны");
  console.log("    📓  21 запись в дневнике");
  console.log("    🎯  5 целей + история прогресса");
  console.log("    💰  7 категорий + 32 транзакции + 5 бюджетов");
  console.log("    🛒  3 списка покупок + товары");
  console.log("    🔔  6 напоминаний");
  console.log("    ⭐  XP пересчитан");
  console.log(`\n  Открой http://localhost:3000/dashboard\n`);
}

main();
