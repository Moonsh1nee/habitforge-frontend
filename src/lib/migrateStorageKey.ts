/**
 * One-time migration helper for the HabitForge -> GetGrip rebrand: copies a
 * value from an old localStorage key to a new one (if the new key doesn't
 * already have data) so existing users don't lose locally-persisted settings
 * (dashboard layout, task view, onboarding progress, etc.) when the storage
 * key names change. Safe to call on every module load — it's a no-op once
 * the new key is populated, and a no-op on the server (no localStorage).
 */
export function migrateStorageKey(oldKey: string, newKey: string) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(newKey) === null) {
      const old = localStorage.getItem(oldKey);
      if (old !== null) {
        localStorage.setItem(newKey, old);
      }
    }
  } catch {
    // localStorage unavailable (private mode, disabled, etc.) — ignore.
  }
}
