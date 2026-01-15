// /lib/notify.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ✅ da se notifikacije prikazu i dok je app otvoren
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationsPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

export async function scheduleTaskReminder(opts: {
  taskId: string;
  title: string;
  dueAt: number; // ms timestamp
  minutesBefore?: number; // default 30
}) {
  const minutesBefore = typeof opts.minutesBefore === "number" ? opts.minutesBefore : 30;

  const when = new Date(opts.dueAt - minutesBefore * 60_000);
  if (when.getTime() <= Date.now() + 5_000) {
    // ako je prekasno za "minutes before", zakaži odmah ili preskoči
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Famigo • Tko preuzima?",
      body: `Uskoro: ${opts.title}`,
      data: { taskId: opts.taskId, kind: "task_reminder" },
    },
    trigger: when,
  });
}
