#!/usr/bin/env node
/**
 * HabitForge — seed script
 * Fills one user's account with realistic test data across all modules.
 *
 * Usage:
 *   node scripts/seed-user.mjs --email user@example.com --password secret
 *   node scripts/seed-user.mjs --email user@example.com --password secret --url http://localhost:8000
 *   node scripts/seed-user.mjs --email user@example.com --password secret --clean
 *
 * Requires Node 18+ (native fetch + getSetCookie).
 */

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const BASE_URL = getArg("url") ?? "http://localhost:8000";
const EMAIL = getArg("email");
const PASSWORD = getArg("password");
const CLEAN = hasFlag("clean");

if (!EMAIL || !PASSWORD) {
  console.error("Usage: node scripts/seed-user.mjs --email <email> --password <password> [--url <url>] [--clean]");
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

  // Store any new cookies
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) parseCookies(setCookie);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const get = (path) => req("GET", path);
const post = (path, body) => req("POST", path, body);
const patch = (path, body) => req("PATCH", path, body);
const del = (path) => req("DELETE", path);
const delSafe = (path) => del(path).catch(() => null);

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

// Generate array of past dates with given completion rate (randomly dropped)
function pastDates(totalDays, completionRate = 0.8) {
  const dates = [];
  for (let i = 1; i <= totalDays; i++) {
    if (Math.random() < completionRate) {
      dates.push(daysAgo(i));
    }
  }
  return dates;
}

// ─── Progress logger ──────────────────────────────────────────────────────────

function log(emoji, msg) {
  process.stdout.write(`  ${emoji}  ${msg}\n`);
}

function section(title) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(50));
}

// ─── Clean function ───────────────────────────────────────────────────────────

async function cleanUser() {
  section("Очистка данных пользователя");

  // Finance transactions (before categories, to avoid FK issues)
  const txns = await get("/finance/transactions?limit=1000").catch(() => []);
  const txnList = Array.isArray(txns) ? txns : [];
  for (const t of txnList) await delSafe(`/finance/transactions/${t.id}`);
  log("🗑️ ", `Транзакции: ${txnList.length}`);

  // Finance categories
  const cats = await get("/finance/categories").catch(() => []);
  const catList = Array.isArray(cats) ? cats : [];
  for (const c of catList) await delSafe(`/finance/categories/${c.id}`);
  log("🗑️ ", `Категории финансов: ${catList.length}`);

  // Goals
  const goals = await get("/goals").catch(() => []);
  const goalList = Array.isArray(goals) ? goals : [];
  for (const g of goalList) await delSafe(`/goals/${g.id}`);
  log("🗑️ ", `Цели: ${goalList.length}`);

  // Journal entries (date may include time component — strip to YYYY-MM-DD)
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

  // Workout logs (cascade deletes exercise logs)
  const wLogs = await get("/workouts/logs?limit=1000").catch(() => []);
  const wLogList = Array.isArray(wLogs) ? wLogs : [];
  for (const w of wLogList) await delSafe(`/workouts/logs/${w.id}`);
  log("🗑️ ", `Тренировки: ${wLogList.length}`);

  // Workout plans (cascade deletes exercises)
  const wPlans = await get("/workouts/plans").catch(() => []);
  const wPlanList = Array.isArray(wPlans) ? wPlans : [];
  for (const p of wPlanList) await delSafe(`/workouts/plans/${p.id}`);
  log("🗑️ ", `Планы тренировок: ${wPlanList.length}`);

  // Tasks — fetch all (including completed), delete parent tasks first (subtasks cascade)
  const tasksData = await get("/tasks/?limit=500&completed=false").catch(() => ({ items: [] }));
  const tasksDone = await get("/tasks/?limit=500&completed=true").catch(() => ({ items: [] }));
  const allTasks = [
    ...(tasksData.items ?? []),
    ...(tasksDone.items ?? []),
  ];
  // Delete parents before children (children cascade anyway, but avoid 404 noise)
  const parents = allTasks.filter((t) => !t.parentId);
  const children = allTasks.filter((t) => t.parentId);
  for (const t of parents) await delSafe(`/tasks/${t.id}`);
  for (const t of children) await delSafe(`/tasks/${t.id}`);
  log("🗑️ ", `Задачи: ${allTasks.length}`);

  // Habits (cascade deletes logs)
  const habitsData = await get("/habits/?limit=200").catch(() => ({ items: [] }));
  const habitList = habitsData.items ?? [];
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

// ─── Seed functions ───────────────────────────────────────────────────────────

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
    log("📁", `Проект "${p.name}" (${created.id})`);
  }
  return ids; // [workId, personalId, healthId]
}

async function seedTags() {
  section("Tags");
  const list = [
    { name: "срочно", color: "#ef4444" },
    { name: "важное", color: "#f59e0b" },
    { name: "рутина", color: "#64748b" },
    { name: "учёба", color: "#7c3aed" },
    { name: "проект", color: "#06b6d4" },
  ];
  const ids = [];
  for (const t of list) {
    const created = await post("/tags/", t);
    ids.push(created.id);
    log("🏷️ ", `Тег "${t.name}" (${created.id})`);
  }
  return ids; // [urgentId, importantId, routineId, studyId, projectId]
}

async function seedHabits() {
  section("Habits + logs (45 дней)");
  const habits = [
    { title: "Медитация", icon: "🧘", color: "#7c3aed", frequency: "daily", rate: 0.82 },
    { title: "Чтение 30 мин", icon: "📚", color: "#06b6d4", frequency: "daily", rate: 0.72 },
    { title: "Спорт/тренировка", icon: "💪", color: "#22c55e", frequency: "daily", rate: 0.58 },
    { title: "Пить воду 2л", icon: "💧", color: "#0ea5e9", frequency: "daily", rate: 0.91 },
    { title: "Ранний подъём", icon: "🌅", color: "#f59e0b", frequency: "daily", rate: 0.65 },
  ];

  const ids = [];
  for (const { rate, ...habit } of habits) {
    const created = await post("/habits/", habit);
    ids.push(created.id);

    // Bulk log past completions
    const dates = pastDates(45, rate);
    if (dates.length) {
      await post(`/habits/${created.id}/logs/bulk`, { dates });
    }
    log("✅", `Привычка "${habit.title}" — ${dates.length} отметок за 45 дней`);
  }
  return ids;
}

async function seedTasks(projectIds, tagIds) {
  section("Tasks");
  const [workId, personalId, healthId] = projectIds;
  const [urgentId, importantId, routineId, studyId, projectTagId] = tagIds;

  const tasks = [
    // High priority
    {
      title: "Исправить критический баг в авторизации",
      priority: 1,
      dueDate: daysAgo(2),
      projectId: workId,
      tags: [urgentId, importantId],
      completed: false,
      description: "Пользователи не могут войти через OAuth. Нужно проверить redirect URL.",
    },
    {
      title: "Настроить CI/CD для продакшн-деплоя",
      priority: 1,
      dueDate: daysAgo(5),
      projectId: workId,
      tags: [projectTagId],
      completed: true,
    },
    {
      title: "Написать документацию для REST API",
      priority: 1,
      dueDate: daysFromNow(3),
      projectId: workId,
      tags: [importantId, projectTagId],
      completed: false,
      description: "Swagger + Postman коллекция для всех эндпоинтов.",
    },

    // Medium priority
    {
      title: "Обновить зависимости проекта",
      priority: 2,
      dueDate: daysAgo(10),
      projectId: workId,
      tags: [routineId],
      completed: true,
    },
    {
      title: "Написать unit-тесты для модуля аутентификации",
      priority: 2,
      dueDate: daysAgo(3),
      projectId: workId,
      tags: [importantId],
      completed: true,
    },
    {
      title: "Встреча с командой — планирование квартала",
      priority: 2,
      dueDate: today(),
      projectId: workId,
      tags: [urgentId],
      completed: false,
    },
    {
      title: "Добавить тёмную тему в мобильное приложение",
      priority: 2,
      dueDate: daysFromNow(7),
      projectId: workId,
      tags: [projectTagId],
      completed: false,
    },
    {
      title: "Прочитать книгу «Clean Architecture»",
      priority: 2,
      dueDate: daysFromNow(14),
      projectId: personalId,
      tags: [studyId],
      completed: false,
      description: "Глава 5–12. Конспект основных принципов.",
    },
    {
      title: "Записаться к стоматологу",
      priority: 2,
      dueDate: daysFromNow(5),
      projectId: healthId,
      tags: [importantId],
      completed: false,
    },

    // Low priority
    {
      title: "Обновить профиль на LinkedIn",
      priority: 3,
      projectId: personalId,
      tags: [],
      completed: true,
    },
    {
      title: "Купить новые кроссовки для бега",
      priority: 3,
      dueDate: daysFromNow(10),
      projectId: healthId,
      tags: [],
      completed: false,
    },
    {
      title: "Разобрать почту и архивировать старые письма",
      priority: 3,
      projectId: personalId,
      tags: [routineId],
      completed: false,
    },
    {
      title: "Почитать про GraphQL subscriptions",
      priority: 3,
      dueDate: daysFromNow(20),
      projectId: workId,
      tags: [studyId],
      completed: false,
    },
  ];

  const createdTasks = [];
  for (const { tags, ...task } of tasks) {
    const created = await post("/tasks/", {
      title: task.title,
      description: task.description ?? null,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      projectId: task.projectId ?? null,
      completed: task.completed ?? false,
    });

    // Assign tags
    for (const tagId of tags) {
      await post(`/tasks/${created.id}/tags`, { tagId });
    }

    createdTasks.push(created);
    log("📝", `"${task.title}" [P${task.priority}]${task.completed ? " ✓" : ""}`);
  }

  // Add subtasks (wrapped — backend 500 on this endpoint on some setups)
  try {
    const bugTask = createdTasks[0];
    const subtasks1 = [
      "Воспроизвести баг в dev-окружении",
      "Найти проблемный коммит через git bisect",
      "Исправить redirect URL в OAuth конфиге",
      "Написать regression-тест",
    ];
    for (const title of subtasks1) {
      await post(`/tasks/${bugTask.id}/subtasks`, { title, priority: 1 });
    }
    log("  ↳", `${subtasks1.length} подзадач к "${bugTask.title}"`);

    const ciTask = createdTasks[1];
    const subtasks2 = [
      "Настроить GitHub Actions workflow",
      "Добавить деплой на staging",
      "Настроить Slack-уведомления",
    ];
    for (const title of subtasks2) {
      await post(`/tasks/${ciTask.id}/subtasks`, { title, priority: 2 });
    }
    log("  ↳", `${subtasks2.length} подзадач к "${ciTask.title}"`);
  } catch (e) {
    log("⚠️ ", `Подзадачи пропущены (${e.message.slice(0, 80)})`);
  }

  return createdTasks;
}

async function seedWorkouts() {
  section("Workouts");

  // Create a plan
  const plan = await post("/workouts/plans", {
    name: "Силовая программа Push/Pull/Legs",
    description: "3 дня в неделю — Push, Pull, Legs по кругу",
    daysPerWeek: 3,
  });
  log("📋", `План "${plan.name}"`);

  const exercises = [
    { name: "Жим лёжа", muscleGroup: "Грудь", sets: 4, repsPerSet: 8, weightKg: 80 },
    { name: "Приседания со штангой", muscleGroup: "Ноги", sets: 4, repsPerSet: 6, weightKg: 100 },
    { name: "Становая тяга", muscleGroup: "Спина", sets: 3, repsPerSet: 5, weightKg: 120 },
    { name: "Подтягивания", muscleGroup: "Спина/Бицепс", sets: 4, repsPerSet: 10, weightKg: null },
    { name: "Жим гантелей сидя", muscleGroup: "Плечи", sets: 3, repsPerSet: 12, weightKg: 22 },
    { name: "Отжимания на брусьях", muscleGroup: "Грудь/Трицепс", sets: 3, repsPerSet: 12, weightKg: null },
  ];
  for (const ex of exercises) {
    await post(`/workouts/plans/${plan.id}/exercises`, ex);
  }
  log("🏋️ ", `${exercises.length} упражнений добавлено в план`);

  // Create workout logs (past ~3 weeks, 3x/week)
  const workoutDays = [1, 3, 6, 8, 10, 13, 15, 17, 20, 22, 24];
  const durations = [55, 62, 48, 70, 58, 65, 50, 72, 60, 55, 68];
  const notesPool = [
    "Отличная тренировка, поставил PR в жиме!",
    "Немного устал, но завершил все сеты",
    "Лёгкая тренировка после болезни",
    "Плечи ещё побаливают, снизил вес",
    "Хорошая скорость восстановления",
    null,
  ];

  for (let i = 0; i < workoutDays.length; i++) {
    const log_ = await post("/workouts/logs", {
      planId: plan.id,
      date: daysAgo(workoutDays[i]),
      durationMinutes: durations[i],
      notes: notesPool[i % notesPool.length],
    });

    // Add exercise logs for each session
    const sessionExercises = exercises.slice(0, 4).map((ex) => ({
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets,
      repsPerSet: ex.repsPerSet,
      weightKg: ex.weightKg
        ? ex.weightKg + Math.floor(Math.random() * 5 - 2) // ±2kg variation
        : null,
    }));
    for (const ex of sessionExercises) {
      await post(`/workouts/logs/${log_.id}/exercises`, ex);
    }
    log("💪", `Тренировка ${daysAgo(workoutDays[i])} — ${durations[i]} мин`);
  }
}

async function seedNutrition() {
  section("Nutrition (14 дней)");

  // Nutrition plan
  const plan = await post("/nutrition/plans", {
    name: "Набор мышечной массы",
    description: "Профицит 300 ккал, высокий белок",
    targetCalories: 2800,
    targetProtein: 180,
    targetCarbs: 320,
    targetFat: 80,
  });
  log("🥗", `Plan: "${plan.name}"`);

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

  let logCount = 0;
  for (let day = 1; day <= 14; day++) {
    const date = daysAgo(day);
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
    for (const mealType of mealTypes) {
      const options = meals[mealType];
      const meal = options[day % options.length];
      await post("/nutrition/logs", { ...meal, date, mealType, notes: null });
      logCount++;
    }
    log("🍽️ ", `${date} — 4 приёма пищи`);
  }
}

async function seedJournal() {
  section("Journal (14 дней)");

  const entries = [
    { mood: 5, energy: 5, stressLevel: 2, sleepHours: 8, sleepQuality: 5, weight: 82.4,
      notes: "Прекрасный день! Завершил все задачи, сходил на тренировку, вечером читал книгу. Чувствую себя продуктивным.",
      wins: "Закрыл 5 задач, пробежал 5 км, приготовил здоровый ужин",
      improvements: "Нужно меньше сидеть в телефоне перед сном" },
    { mood: 4, energy: 4, stressLevel: 3, sleepHours: 7.5, sleepQuality: 4, weight: 82.2,
      notes: "Хороший рабочий день. Встреча с командой прошла продуктивно. Немного устал к вечеру.",
      wins: "Провёл успешную встречу, написал документацию",
      improvements: "Больше пить воды в течение дня" },
    { mood: 3, energy: 3, stressLevel: 4, sleepHours: 6.5, sleepQuality: 3, weight: 82.5,
      notes: "Сложный день — много дедлайнов. Не успел сходить на тренировку. Вечером медитировал 20 минут.",
      wins: "Медитация помогла снять стресс",
      improvements: "Лучше планировать время для спорта" },
    { mood: 4, energy: 4, stressLevel: 2, sleepHours: 8.5, sleepQuality: 5, weight: 82.1,
      notes: "Выспался впервые за неделю! Тренировка была огонь — поставил личный рекорд в жиме.",
      wins: "Личный рекорд: жим лёжа 85 кг × 8",
      improvements: null },
    { mood: 5, energy: 5, stressLevel: 1, sleepHours: 8, sleepQuality: 5, weight: 82.0,
      notes: "Выходной — провёл время с семьёй, прогулка в парке 2 часа. Полностью восстановился.",
      wins: "Прогулка 2 часа, вкусный ужин дома, настольные игры с близкими",
      improvements: null },
    { mood: 4, energy: 3, stressLevel: 3, sleepHours: 7, sleepQuality: 3, weight: 82.3,
      notes: "Начало недели немного тяжёлое. Зато дочитал раздел книги по архитектуре ПО.",
      wins: "Прочитал 40 страниц Clean Architecture",
      improvements: "Ложиться спать до 23:00" },
    { mood: 3, energy: 2, stressLevel: 5, sleepHours: 5.5, sleepQuality: 2, weight: 82.6,
      notes: "Не выспался из-за срочного бага в проде. Весь день на кофе. Нужно было лечь раньше.",
      wins: "Починил критический баг за 3 часа",
      improvements: "Не брать задачи в работу после 20:00" },
    { mood: 4, energy: 4, stressLevel: 2, sleepHours: 8, sleepQuality: 4, weight: 82.2,
      notes: "Восстановился после стрессового дня. Тренировка и медитация сделали своё дело.",
      wins: "Силовая тренировка, 20 мин медитации, ранний отбой",
      improvements: null },
    { mood: 5, energy: 4, stressLevel: 2, sleepHours: 7.5, sleepQuality: 4, weight: 82.0,
      notes: "Отличная среда! Завершил все плановые задачи к 16:00, остаток дня — обучение.",
      wins: "Курс по TypeScript — завершил 3 модуля",
      improvements: "Добавить растяжку после тренировки" },
    { mood: 4, energy: 4, stressLevel: 3, sleepHours: 7, sleepQuality: 4, weight: 82.1,
      notes: "Продуктивный день, хотя немного отвлекался на соцсети. Надо работать над фокусом.",
      wins: "Code review 8 PR, помог коллеге с дебагом",
      improvements: "Использовать Pomodoro технику" },
    { mood: 3, energy: 3, stressLevel: 3, sleepHours: 7, sleepQuality: 3, weight: 82.4,
      notes: "Средний день. Ничего особенного. Нужно ставить более конкретные цели на каждый день.",
      wins: "Не пропустил тренировку",
      improvements: "Планировать вечер заранее" },
    { mood: 5, energy: 5, stressLevel: 1, sleepHours: 9, sleepQuality: 5, weight: 81.8,
      notes: "Лучший день месяца! Завершил большой фича-релиз, команда довольна. Отпраздновали.",
      wins: "Релиз v2.0, командный ужин, тренировка утром",
      improvements: null },
    { mood: 4, energy: 4, stressLevel: 2, sleepHours: 7.5, sleepQuality: 4, weight: 82.0,
      notes: "Плавный день после релиза. Разгреб накопившиеся задачи.",
      wins: "Закрыл 12 задач в бэклоге",
      improvements: null },
    { mood: 4, energy: 3, stressLevel: 3, sleepHours: 7, sleepQuality: 4, weight: 82.2,
      notes: "Начал неделю с планирования. Расставил приоритеты на месяц вперёд.",
      wins: "Составил roadmap на Q3",
      improvements: "Добавить больше овощей в рацион" },
  ];

  for (let i = 0; i < entries.length; i++) {
    const date = daysAgo(i + 1);
    const payload = { ...entries[i], date };
    try {
      await post("/journal/entries", payload);
    } catch (e) {
      if (e.message.includes("409")) {
        await patch(`/journal/entries/${date}`, payload);
      } else {
        throw e;
      }
    }
    log("📓", `${date} — настроение ${entries[i].mood}/5`);
  }
}

async function seedGoals() {
  section("Goals");

  const goals = [
    {
      title: "Прочитать 12 книг за год",
      category: "learning",
      targetValue: 12,
      currentValue: 5,
      unit: "книги",
      dueDate: `${new Date().getFullYear()}-12-31`,
    },
    {
      title: "Пробежать 500 км за год",
      category: "fitness",
      targetValue: 500,
      currentValue: 127,
      unit: "км",
      dueDate: `${new Date().getFullYear()}-12-31`,
    },
    {
      title: "Накопить 100 000 рублей",
      category: "finance",
      targetValue: 100000,
      currentValue: 42500,
      unit: "руб",
      dueDate: daysFromNow(120),
    },
    {
      title: "Подтянуться 20 раз подряд",
      category: "fitness",
      targetValue: 20,
      currentValue: 14,
      unit: "раз",
      dueDate: daysFromNow(60),
    },
    {
      title: "Выучить TypeScript на продвинутом уровне",
      category: "learning",
      targetValue: 100,
      currentValue: 68,
      unit: "%",
      dueDate: daysFromNow(45),
    },
  ];

  for (const goal of goals) {
    const created = await post("/goals", goal);
    log("🎯", `"${goal.title}" — ${goal.currentValue}/${goal.targetValue} ${goal.unit}`);
  }
}

async function seedFinance() {
  section("Finance");

  const categories = [
    { name: "Зарплата", icon: "💰", color: "#22c55e" },
    { name: "Еда", icon: "🛒", color: "#f59e0b" },
    { name: "Транспорт", icon: "🚗", color: "#06b6d4" },
    { name: "Развлечения", icon: "🎬", color: "#7c3aed" },
    { name: "Здоровье", icon: "💊", color: "#ef4444" },
    { name: "Обучение", icon: "📚", color: "#8b5cf6" },
    { name: "Коммунальные услуги", icon: "🏠", color: "#64748b" },
  ];

  const catIds = {};
  for (const cat of categories) {
    const created = await post("/finance/categories", cat);
    catIds[cat.name] = created.id;
    log("🗂️ ", `Категория "${cat.name}"`);
  }

  // Monthly salary (2 months)
  await post("/finance/transactions", {
    type: "income",
    amount: 180000,
    date: daysAgo(32),
    description: "Зарплата за май",
    categoryId: catIds["Зарплата"],
  });
  await post("/finance/transactions", {
    type: "income",
    amount: 185000,
    date: daysAgo(2),
    description: "Зарплата за июнь",
    categoryId: catIds["Зарплата"],
  });
  log("💸", "2 зарплаты добавлено");

  // Expenses over 30 days
  const expenses = [
    { desc: "Продукты в Пятёрочке", cat: "Еда", amount: 3200, day: 1 },
    { desc: "Кофе и обед", cat: "Еда", amount: 650, day: 2 },
    { desc: "Заправка автомобиля", cat: "Транспорт", amount: 4500, day: 3 },
    { desc: "Кино + попкорн", cat: "Развлечения", amount: 1200, day: 4 },
    { desc: "Продукты в Ашане", cat: "Еда", amount: 5800, day: 5 },
    { desc: "Аптека — витамины", cat: "Здоровье", amount: 1800, day: 6 },
    { desc: "Курс по TypeScript", cat: "Обучение", amount: 4900, day: 7 },
    { desc: "Такси", cat: "Транспорт", amount: 380, day: 8 },
    { desc: "Ресторан с друзьями", cat: "Развлечения", amount: 3200, day: 9 },
    { desc: "Продукты", cat: "Еда", amount: 2900, day: 10 },
    { desc: "Коммуналка за май", cat: "Коммунальные услуги", amount: 6200, day: 11 },
    { desc: "Протеин + спортпит", cat: "Здоровье", amount: 3600, day: 12 },
    { desc: "Обед в кафе", cat: "Еда", amount: 780, day: 13 },
    { desc: "Parking + бензин", cat: "Транспорт", amount: 1200, day: 14 },
    { desc: "Netflix + Spotify", cat: "Развлечения", amount: 799, day: 15 },
    { desc: "Продукты доставка", cat: "Еда", amount: 4100, day: 16 },
    { desc: "Врач — плановый осмотр", cat: "Здоровье", amount: 2500, day: 18 },
    { desc: "Такси в аэропорт", cat: "Транспорт", amount: 1800, day: 20 },
    { desc: "Книги + канцтовары", cat: "Обучение", amount: 1450, day: 22 },
    { desc: "Продукты выходного дня", cat: "Еда", amount: 6200, day: 24 },
    { desc: "Коммуналка за июнь", cat: "Коммунальные услуги", amount: 6500, day: 25 },
    { desc: "День рождения коллеги — подарок", cat: "Развлечения", amount: 2800, day: 26 },
    { desc: "Кофе/ланч рабочая неделя", cat: "Еда", amount: 2200, day: 28 },
    { desc: "Абонемент в зал", cat: "Здоровье", amount: 3500, day: 30 },
  ];

  for (const e of expenses) {
    await post("/finance/transactions", {
      type: "expense",
      amount: e.amount,
      date: daysAgo(e.day),
      description: e.desc,
      categoryId: catIds[e.cat],
    });
  }
  log("📊", `${expenses.length} расходных транзакций добавлено`);

  // Freelance income
  await post("/finance/transactions", {
    type: "income",
    amount: 45000,
    date: daysAgo(15),
    description: "Фриланс — разработка лендинга",
    categoryId: catIds["Зарплата"],
  });
  log("✅", "Доп. доход (фриланс) добавлен");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 HabitForge Seed Script");
  console.log(`   API: ${BASE_URL}`);
  console.log(`   User: ${EMAIL}`);
  if (CLEAN) console.log("   Mode: --clean (удаление перед заполнением)");

  // 1. Login
  console.log("🔐 Авторизация...");
  try {
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
    console.log(`   ✅ Вошли как: ${user.firstName ?? ""} <${EMAIL}>\n`);
  } catch (e) {
    console.error("❌ Ошибка входа:", e.message);
    process.exit(1);
  }

  const start = Date.now();

  try {
    if (CLEAN) await cleanUser();

    const projectIds = await seedProjects();
    const tagIds = await seedTags();
    await seedHabits();
    await seedTasks(projectIds, tagIds);
    await seedWorkouts();
    await seedNutrition();
    await seedJournal();
    await seedGoals();
    await seedFinance();
  } catch (e) {
    console.error(`\n❌ Ошибка: ${e.message}`);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(50));
  console.log(`  ✅ Готово! ${requestCount} запросов за ${elapsed}с`);
  console.log("═".repeat(50));
  console.log("\n  Заполнено:");
  console.log("    📁  3 проекта");
  console.log("    🏷️   5 тегов");
  console.log("    ✅  5 привычек + ~45 дней логов");
  console.log("    📝  13 задач с подзадачами и тегами");
  console.log("    💪  1 план тренировок + 11 сессий");
  console.log("    🍽️   14 дней питания (4 приёма/день)");
  console.log("    📓  14 записей в дневнике");
  console.log("    🎯  5 целей");
  console.log("    💰  7 финансовых категорий + 27 транзакций");
  console.log("\n  Открой http://localhost:3000/dashboard\n");
}

main();
