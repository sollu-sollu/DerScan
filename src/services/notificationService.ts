/**
 * DerScan Reminder Service
 * 
 * Lightweight in-app reminder system using MMKV storage.
 * No native push-notification library needed — avoids build conflicts.
 * 
 * How it works:
 * - Stores routine times in MMKV
 * - The PlanScreen reads these and shows visual indicators
 * - When the app is open, it checks if any reminder is due and shows an Alert
 */
import { createMMKV } from 'react-native-mmkv';
import { Alert } from 'react-native';

let storage: any;
try {
  storage = createMMKV({ id: 'derscan-reminders' });
} catch {
  storage = { set: () => {}, getString: () => null, delete: () => {}, getBoolean: () => false };
}
const REMINDERS_KEY = 'scheduled_reminders';
const REMINDERS_ENABLED_KEY = 'reminders_enabled';

interface ReminderStep {
  title: string;
  subtitle: string;
  time: string;
}

/**
 * Initialize the notification system (no-op for this lightweight version).
 */
export function initNotifications() {
  // No native channel creation needed
  console.log('DerScan Reminders initialized (MMKV-based)');
}

/**
 * Parse a time string like "8:00 AM" into hours and minutes.
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hours: 8, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Save routine reminders.
 */
export function scheduleRoutineReminders(routine: ReminderStep[]) {
  storage.set(REMINDERS_KEY, JSON.stringify(routine));
  storage.set(REMINDERS_ENABLED_KEY, true);
  console.log(`Saved ${routine.length} reminders`);
}

/**
 * Cancel all reminders.
 */
export function cancelAllReminders() {
  try {
    if (storage && typeof storage.delete === 'function') {
      storage.delete(REMINDERS_KEY);
    } else if (storage) {
      storage.set(REMINDERS_KEY, '[]');
    }
    if (storage) {
      storage.set(REMINDERS_ENABLED_KEY, false);
    }
    console.log('All reminders cancelled safely');
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Check if reminders are enabled.
 */
export function areRemindersEnabled(): boolean {
  return storage.getBoolean(REMINDERS_ENABLED_KEY) ?? false;
}

/**
 * Get saved reminders.
 */
export function getSavedReminders(): ReminderStep[] {
  const raw = storage.getString(REMINDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Check if any reminder is due right now (within ±5 min window).
 * Call this periodically (e.g., on app focus) to show alerts.
 */
export function checkDueReminders(): ReminderStep | null {
  if (!areRemindersEnabled()) return null;

  const reminders = getSavedReminders();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const r of reminders) {
    const { hours, minutes } = parseTime(r.time);
    const reminderMinutes = hours * 60 + minutes;
    const diff = Math.abs(currentMinutes - reminderMinutes);

    if (diff <= 5) {
      return r;
    }
  }

  return null;
}

/**
 * Show an alert if a reminder is due. Safe to call frequently.
 */
let lastAlertedTime = '';
export function showDueReminderAlert() {
  const due = checkDueReminders();
  if (due && due.time !== lastAlertedTime) {
    lastAlertedTime = due.time;
    Alert.alert(
      `⏰ ${due.title}`,
      due.subtitle,
      [{ text: 'Got it', style: 'default' }]
    );
  }
}
