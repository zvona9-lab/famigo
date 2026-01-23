// /lib/notify.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Show notifications even when app is open (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationsPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (status !== "granted") return false;

  // Android: ensure a high-importance channel exists
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2F6BFF",
      sound: "default",
    });
  }

  return true;
}

export type ScheduleTaskReminderArgs = {
  taskId: string;
  title: string;          // task title
  dueAt: number;          // timestamp (ms)
  minutesBefore: number;  // 15 / 30 / 60
};

/**
 * Local reminder (device notification).
 * Returns the notification id or null if it cannot be scheduled.
 */
export async function scheduleTaskReminder(opts: ScheduleTaskReminderArgs): Promise<string | null> {
  const ok = await ensureNotificationsPermission();
  if (!ok) return null;

  const when = new Date(opts.dueAt - opts.minutesBefore * 60_000);

  // If it's too late, don't schedule (avoid instant spam).
  if (when.getTime() <= Date.now() + 5_000) return null;

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Famigo • Reminder",
      body: `Coming up: ${opts.title}`,
      data: { taskId: opts.taskId, kind: "task_reminder" },
      sound: "default",
    },
    trigger: when,
  });
}

/**
 * Cancel a previously scheduled reminder by id.
 */
export async function cancelScheduledReminder(notificationId: string | null | undefined) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}
