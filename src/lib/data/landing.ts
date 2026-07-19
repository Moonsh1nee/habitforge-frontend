import {
  CheckSquare, Repeat2, Wallet, Dumbbell, Apple,
  BookOpen, ShoppingCart, BarChart2,
} from "lucide-react";

export const FEATURES = [
  { icon: CheckSquare,  label: "Задачи",     desc: "Подзадачи, проекты, теги, приоритеты и DnD-сортировка",  color: "#7c3aed" },
  { icon: Repeat2,      label: "Привычки",   desc: "Стрики, заморозки, трекер выполнения и годовой хитмап",  color: "#06b6d4" },
  { icon: Wallet,       label: "Финансы",    desc: "Доходы, расходы, категории и визуализация трат",         color: "#22c55e" },
  { icon: Dumbbell,     label: "Тренировки", desc: "Планы упражнений, логи тренировок, прогресс по весам",   color: "#f59e0b" },
  { icon: Apple,        label: "Питание",    desc: "Калории, макросы, план питания и журнал приёмов пищи",   color: "#ef4444" },
  { icon: BookOpen,     label: "Дневник",    desc: "Настроение, энергия, сон, вес и личные заметки",         color: "#8b5cf6" },
  { icon: ShoppingCart, label: "Покупки",    desc: "Списки покупок с автоматическим созданием транзакции",   color: "#0ea5e9" },
  { icon: BarChart2,    label: "Аналитика",  desc: "Хитмапы, графики, статистика по всем модулям сразу",    color: "#ec4899" },
] as const;

export const STEPS = [
  { n: "1", title: "Настрой",    desc: "Выбери нужные модули — от задач до питания. Убери лишнее, оставь главное." },
  { n: "2", title: "Трекай",     desc: "Отмечай привычки, добавляй задачи, логируй тренировки — всё в одном месте." },
  { n: "3", title: "Анализируй", desc: "Смотри графики, стрики и хитмапы. Видь прогресс, корректируй курс." },
] as const;

export const FREE_FEATURES = [
  { label: "До 5 привычек",        included: true  },
  { label: "До 3 проектов",        included: true  },
  { label: "Аналитика за 7 дней",  included: true  },
  { label: "Задачи и журнал",      included: true  },
  { label: "Тренировки и питание", included: true  },
  { label: "Push-уведомления",     included: true  },
  { label: "Годовой хитмап",       included: false },
  { label: "Шаблоны программ",     included: false },
];

export const PRO_FEATURES = [
  { label: "Неограниченные привычки", included: true },
  { label: "Неограниченные проекты",  included: true },
  { label: "Аналитика за 90 дней",   included: true },
  { label: "Задачи и журнал",        included: true },
  { label: "Тренировки и питание",   included: true },
  { label: "Push-уведомления",       included: true },
  { label: "Годовой хитмап",         included: true },
  { label: "Шаблоны программ",       included: true },
];

export const SOCIAL_PROOF = [
  { value: "8",    label: "Модулей в одном приложении" },
  { value: "∞",    label: "Интеграций между ними"      },
  { value: "Free", label: "Базовый план навсегда"       },
] as const;

// Motion variants
export const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.5 } },
} as const;
