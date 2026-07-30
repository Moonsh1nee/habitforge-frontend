import { create } from "zustand";
import { getTodayString } from "@/lib/utils";
import { migrateStorageKey } from "@/lib/migrateStorageKey";

type Phase = "idle" | "work" | "break";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const STORAGE_KEY = "getgrip-pomodoro-sessions";

migrateStorageKey("habitforge-pomodoro-sessions", STORAGE_KEY);

function loadSessionCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const { count, date } = JSON.parse(raw);
    return date === getTodayString() ? (count as number) : 0;
  } catch {
    return 0;
  }
}

function saveSessionCount(count: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, date: getTodayString() }));
}

interface PomodoroState {
  phase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  selectedTaskId: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  nextPhase: () => void;
  setTask: (id: string | null) => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  phase: "idle",
  secondsLeft: WORK_SECONDS,
  isRunning: false,
  sessionCount: 0,
  selectedTaskId: null,

  start: () => set({ phase: get().phase === "idle" ? "work" : get().phase, isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ phase: "idle", secondsLeft: WORK_SECONDS, isRunning: false }),

  tick: () => {
    const { secondsLeft, nextPhase } = get();
    if (secondsLeft <= 1) {
      nextPhase();
    } else {
      set({ secondsLeft: secondsLeft - 1 });
    }
  },

  nextPhase: () => {
    const { phase, sessionCount } = get();
    if (phase === "work") {
      const next = sessionCount + 1;
      saveSessionCount(next);
      set({ phase: "break", secondsLeft: BREAK_SECONDS, isRunning: false, sessionCount: next });
    } else {
      set({ phase: "work", secondsLeft: WORK_SECONDS, isRunning: false });
    }
  },

  setTask: (id) => set({ selectedTaskId: id }),
}));

export function initPomodoroSessionCount() {
  usePomodoroStore.setState({ sessionCount: loadSessionCount() });
}
