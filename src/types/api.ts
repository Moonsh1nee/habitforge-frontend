export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
  isActive: boolean;
  plan: "free" | "pro";
  role: "user" | "admin";
  onboardingCompleted: boolean;
  dailyDigestTime: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export interface GoogleCalendarStatus {
  connected: boolean;
  calendarId?: string;
  lastSyncedAt?: string;
}

export interface AuthResponse {
  user: User;
}

// ─── Tags & Projects ─────────────────────────────────────────────────────────

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  sortOrder: number;
  tasksCount: number;
  tasksDone: number;
  createdAt: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

// 1=high, 2=medium, 3=low
export type TaskPriority = 1 | 2 | 3;
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "cancelled";
export type TaskReminderMode = "none" | "at_time" | "before_due";

export interface Task {
  id: string;
  userId: string;
  parentId: string | null;
  projectId: string | null;
  goalId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  icon: string | null;
  coverColor: string | null;
  estimatedMinutes: number | null;
  timeSpentMinutes: number;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  isRecurring: boolean;
  recurrence: "daily" | "weekly" | "monthly" | null;
  isAllDay: boolean;
  reminderMode: TaskReminderMode;
  reminderAt: string | null;
  reminderMinutesBefore: number | null;
  reminderSnoozedUntil: string | null;
  subtasksCount: number;
  subtasksDone: number;
  commentsCount: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: { username: string; firstName: string | null };
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitFrequency = "daily" | "weekly" | "weekdays";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string;
  frequency: HabitFrequency;
  targetPerWeek: number | null;
  weekdays: number[] | null;
  isArchived: boolean;
  freezeAvailable: number;
  freezeUsedDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  note: string | null;
  createdAt: string;
}

export interface HabitStats {
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  start_date: string | null;
  end_date: string | null;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  daysPerWeek: number | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanExercise {
  id: string;
  planId: string;
  name: string;
  muscleGroup: string | null;
  sets: number | null;
  repsPerSet: number | null;
  weightKg: number | null;
  orderInPlan: number;
  notes: string | null;
}

export interface WorkoutPlanWithExercises extends WorkoutPlan {
  exercises: PlanExercise[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId: string | null;
  date: string;
  durationMinutes: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseLog {
  id: string;
  workoutLogId: string;
  name: string;
  muscleGroup: string | null;
  sets: number | null;
  repsPerSet: number | null;
  weightKg: number | null;
  notes: string | null;
}

export interface WorkoutLogWithExercises extends WorkoutLog {
  exercises: ExerciseLog[];
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  createdAt: string;
}

export interface MealTemplate {
  id: string;
  planId: string;
  name: string;
  mealType: MealType;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entries_count: number;
}

// ─── Journal ─────────────────────────────────────────────────────────────────

export interface DailyEntry {
  id: string;
  userId: string;
  date: string;
  mood: number | null;
  energy: number | null;
  stressLevel: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  weight: number | null;
  notes: string | null;
  wins: string | null;
  improvements: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  period_start: string | null;
  period_end: string | null;
  entries_count: number;
  avg_mood: number | null;
  avg_energy: number | null;
  avg_stress: number | null;
  avg_sleep_hours: number | null;
  avg_sleep_quality: number | null;
  weight_history: { date: string; weight: number }[];
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface HabitToday {
  id: string;
  title: string;
  icon: string | null;
  color: string;
  frequency: HabitFrequency;
  completed_today: boolean;
}

export interface TodayDashboard {
  date: string;
  tasks_pending: Task[];
  tasks_overdue: Task[];
  habits: HabitToday[];
  workout: WorkoutLog | null;
  nutrition_calories: number;
  journal_entry: DailyEntry | null;
}

export interface WeekStats {
  week_start: string;
  week_end: string;
  tasks_completed: number;
  tasks_total: number;
  habits_completion_rate: number;
  workouts_count: number;
  avg_calories: number;
  avg_mood: number | null;
  avg_energy: number | null;
  avg_sleep_hours: number | null;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResultItem {
  type: "task" | "habit" | "journal" | "finance_transaction" | "finance_category" | "goal";
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  description?: string | null;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string | null;
  date?: string;
  notes?: string;
  amount?: number | null;
  transactionType?: TransactionType | null;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export interface FinanceCategory {
  id:        string;
  userId:    string;
  name:      string;
  icon:      string | null;
  color:     string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id:          string;
  userId:      string;
  categoryId:  string | null;
  type:        TransactionType;
  amount:      number;
  description: string | null;
  date:        string;
  createdAt:   string;
  updatedAt:   string;
}

export interface CategorySummary {
  categoryId:    string | null;
  categoryName:  string;
  categoryIcon:  string | null;
  categoryColor: string | null;
  type:          TransactionType;
  total:         number;
  count:         number;
}

export interface FinanceSummary {
  period_start:       string;
  period_end:         string;
  total_income:       number;
  total_expense:      number;
  balance:            number;
  transactions_count: number;
  by_category:        CategorySummary[];
}

// ─── Shopping ────────────────────────────────────────────────────────────────

export type ShoppingListStatus = "active" | "completed" | "cancelled";

export interface ShoppingList {
  id:            string;
  name:          string;
  store:         string | null;
  plannedDate:   string | null;
  plannedTime:   string | null;
  status:        ShoppingListStatus;
  notes:         string | null;
  transactionId: string | null;
  totalPlanned:  number;
  totalActual:   number;
  itemsCount:    number;
  itemsChecked:  number;
  createdAt:     string;
  updatedAt:     string;
}

export interface ShoppingItem {
  id:           string;
  listId:       string;
  name:         string;
  quantity:     number;
  unit:         string | null;
  plannedPrice: number | null;
  actualPrice:  number | null;
  categoryId:   string | null;
  checked:      boolean;
  sortOrder:    number;
  notes:        string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingItem[];
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalCategory =
  | "health"
  | "fitness"
  | "productivity"
  | "finance"
  | "learning"
  | "other";

export type GoalStatus = "active" | "completed" | "archived";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  color: string | null;
  icon: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  progressPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  value: number;
  note: string | null;
  loggedAt: string;
}

// ─── Billing / Subscription ──────────────────────────────────────────────────

export interface Subscription {
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export type ReminderEntityType = "task" | "habit" | "goal";
export type ReminderRecurrence = "once" | "daily" | "weekly";

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  entityType: ReminderEntityType | null;
  entityId: string | null;
  remindAt: string;
  recurrence: ReminderRecurrence;
  recurrenceTime: string | null;
  daysOfWeek: number[] | null;
  isActive: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

// ─── Time Tracking ───────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  note: string | null;
  createdAt: string;
}

export interface TimerStatus {
  isRunning: boolean;
  currentEntry: TimeEntry | null;
  taskId: string | null;
  elapsedMinutes: number;
}

export interface TimeTrackingToday {
  totalMinutes: number;
  entries: TimeEntry[];
  byTask: { taskId: string; taskTitle: string; minutes: number }[];
}

export interface TimeTrackingSummary {
  period: string;
  totalMinutes: number;
  byDay: { date: string; minutes: number }[];
  topTasks: { taskId: string; taskTitle: string; minutes: number }[];
}

// ─── Task Activity ────────────────────────────────────────────────────────────

export type TaskActivityType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "due_date_changed"
  | "assigned"
  | "comment_added"
  | "subtask_added";

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  type: TaskActivityType;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  author?: { username: string; firstName: string | null };
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarEventType = "task" | "habit" | "workout" | "journal" | "reminder";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  color: string | null;
  completed: boolean;
  entityId: string;
  url: string | null;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  isCurrent: boolean;
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  name: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface BudgetStatus extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
  categoryName: string | null;
  categoryColor: string | null;
}

// ─── Exercise Library & PRs ──────────────────────────────────────────────────

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "glutes"
  | "core"
  | "cardio"
  | "full_body"
  | "other";

export type Equipment = "barbell" | "dumbbell" | "machine" | "bodyweight" | "cable" | "other";
export type RecordType = "max_weight" | "max_reps" | "max_volume";

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  description: string | null;
  isPublic: boolean;
  userId: string | null;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseName: string;
  recordType: RecordType;
  value: number;
  unit: string;
  achievedAt: string;
  workoutLogId: string | null;
  notes: string | null;
}

// ─── Food Search ─────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  servingSizeG: number | null;
  source: "openfoodfacts" | "custom";
}

// ─── XP & Achievements ───────────────────────────────────────────────────────

export type XPSource =
  | "task_completed"
  | "habit_completed"
  | "journal_entry"
  | "workout_logged"
  | "goal_progress"
  | "goal_completed"
  | "streak_bonus"
  | "achievement_unlocked";

export interface XPEvent {
  id: string;
  userId: string;
  source: XPSource;
  xpAmount: number;
  entityId: string | null;
  createdAt: string;
}

export interface UserXP {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  levelProgressPct: number;
}

export type AchievementCategory =
  | "habits"
  | "tasks"
  | "streaks"
  | "health"
  | "finance"
  | "social"
  | "milestones";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: AchievementCategory;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number | null;
  progressTarget: number | null;
}

export interface UserAchievements {
  unlocked: Achievement[];
  locked: Achievement[];
  totalXpFromAchievements: number;
  recentUnlock: Achievement | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  pro_users: number;
  active_today: number;
  new_this_week: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
