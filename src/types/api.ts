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
  createdAt: string;
  updatedAt: string;
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

export interface Task {
  id: string;
  userId: string;
  parentId: string | null;
  projectId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  isRecurring: boolean;
  recurrence: "daily" | "weekly" | "monthly" | null;
  subtasksCount: number;
  subtasksDone: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
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
  type: "task" | "habit" | "journal" | "finance_transaction" | "finance_category";
  id: string;
  title: string;
  description?: string | null;
  // task-specific
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string | null;
  // journal-specific
  date?: string;
  notes?: string;
  // finance_transaction-specific
  amount?: number | null;
  transactionType?: TransactionType | null;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

export interface TelegramLink {
  chatId: number;
  username: string | null;
  isActive: boolean;
  linkedAt: string;
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
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
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
