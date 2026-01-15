import * as Haptics from "expo-haptics";

export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

export async function hapticError() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}
