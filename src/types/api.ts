export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// Tasks
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Habits
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: string;
  targetCount: number;
  color?: string;
  icon?: string;
  isArchived: boolean;
  createdAt: string;
  streak?: number;
  completedToday?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  count: number;
  notes?: string;
  createdAt: string;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  lastCompleted?: string;
}

// Workouts
export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  daysPerWeek: number;
  isArchived: boolean;
  createdAt: string;
  exercises?: PlanExercise[];
}

export interface PlanExercise {
  id: string;
  planId: string;
  name: string;
  muscleGroup?: string;
  sets: number;
  repsPerSet: number;
  weightKg?: number;
  orderInPlan: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId?: string;
  date: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  exercises?: ExerciseLog[];
}

export interface ExerciseLog {
  id: string;
  workoutLogId: string;
  name: string;
  muscleGroup?: string;
  sets: number;
  repsPerSet: number;
  weightKg?: number;
  notes?: string;
}

// Nutrition
export interface NutritionPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  createdAt: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodLog[];
}

// Journal
export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  mood?: number;
  energy?: number;
  stressLevel?: number;
  sleepHours?: number;
  sleepQuality?: number;
  weight?: number;
  notes?: string;
  wins?: string;
  improvements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  avgMood: number;
  avgEnergy: number;
  avgStress: number;
  avgSleep: number;
  weightData: { date: string; weight: number }[];
  entryCount: number;
}

// Dashboard
export interface DashboardToday {
  tasks: Task[];
  habits: (Habit & { completedToday: boolean })[];
  workout?: WorkoutLog;
  nutrition?: NutritionSummary;
  journal?: JournalEntry;
}

export interface DashboardWeek {
  tasks: { completed: number; total: number };
  habits: { name: string; streak: number; completionRate: number }[];
  workouts: number;
  nutrition: { avgCalories: number; avgProtein: number };
  journal: { avgMood: number; avgEnergy: number; avgSleep: number };
}

// Telegram
export interface TelegramLink {
  chatId?: number;
  username?: string;
  isActive: boolean;
  linkedAt?: string;
}
