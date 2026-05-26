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
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

// 1=high, 2=medium, 3=low
export type TaskPriority = 1 | 2 | 3;

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  isRecurring: boolean;
  recurrence: "daily" | "weekly" | "monthly" | null;
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
  type: "task" | "habit" | "journal";
  id: string;
  title: string;
  description?: string | null;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string | null;
  date?: string;
  notes?: string;
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

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
