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
  dashboardLayout: DashboardWidgetConfig[] | null;
  enabledModules: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export type WidgetSpan = "third" | "half" | "full";

export interface DashboardWidgetConfig {
  id: string;
  visible: boolean;
  span?: WidgetSpan;
  settings?: Record<string, unknown>;
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
  journal_entry: DailyEntry | null;
}

export interface WeekStats {
  week_start: string;
  week_end: string;
  tasks_completed: number;
  tasks_total: number;
  habits_completion_rate: number;
  avg_mood: number | null;
  avg_energy: number | null;
  avg_sleep_hours: number | null;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResultItem {
  type: "task" | "habit" | "journal" | "goal";
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
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
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
}

export interface TimerStatus {
  running: boolean;
  started_at?: string;
  elapsed_seconds?: number;
}

export interface RunningTaskInfo {
  task_id: string;
  title: string;
  started_at: string;
}

export interface TimeTrackingToday {
  total_minutes: number;
  running_task: RunningTaskInfo | null;
  entries: TimeEntry[];
}

export interface TimeTrackingSummary {
  total_minutes: number;
  by_project: { project_id: string; project_name: string; minutes: number }[];
  by_day: { date: string; minutes: number }[];
  running_task: RunningTaskInfo | null;
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

export type CalendarEventSource = "task" | "habit" | "journal";

export interface CalendarEvent {
  id: string;
  source: CalendarEventSource;
  source_id: string;
  title: string;
  date: string;
  time?: string | null;
  duration_minutes?: number | null;
  completed?: boolean;
  priority?: number | null;
  color: string | null;
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


// ─── XP & Achievements ───────────────────────────────────────────────────────

export type XPSource =
  | "task_completed"
  | "habit_completed"
  | "journal_entry"
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
  xpForNextLevel: number;
  xpProgressPct: number;
  recentEvents: { source: string; xpAmount: number; createdAt: string }[];
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
  progress?: number | null;
  progressTarget?: number | null;
}

export interface UserAchievements {
  unlocked: Achievement[];
  locked: Achievement[];
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
