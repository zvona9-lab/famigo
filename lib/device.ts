// /lib/device.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";

const STORAGE_KEY = "famigo.device.v1";

export type DeviceInfo = {
  deviceId: string;          // stabilno kroz reinstalle? -> NE. Stabilno dok AsyncStorage postoji.
  platform: "ios" | "android" | "web" | "unknown";
  osVersion?: string | null;

  deviceName?: string | null; // npr. "iPhone 14", "SM-G998B", ili slično
  model?: string | null;      // npr. "iPhone", "Samsung ..."

  appVersion?: string | null;
  buildVersion?: string | null;
};

function getPlatform(): DeviceInfo["platform"] {
  const p = Platform.OS;
  if (p === "ios" || p === "android" || p === "web") return p;
  return "unknown";
}

function safeString(v: any): string | null {
  if (typeof v === "string" && v.trim().length) return v.trim();
  return null;
}

async function loadStored(): Promise<DeviceInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.deviceId) return parsed as DeviceInfo;
    return null;
  } catch {
    return null;
  }
}

async function saveStored(info: DeviceInfo) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
}

async function generateId(): Promise<string> {
  // UUID v4 preko crypto (expo)
  const uuid = Crypto.randomUUID();
  return uuid;
}

function buildDeviceName(): string | null {
  // expo-device daje razne podatke; nisu svi dostupni na svim platformama
  const brand = safeString((Device as any).brand);
  const manufacturer = safeString((Device as any).manufacturer);
  const modelName = safeString((Device as any).modelName);
  const modelId = safeString((Device as any).modelId);

  // najbolji redoslijed:
  // 1) modelName (najljepši)
  // 2) brand + modelId
  // 3) manufacturer + modelId
  // 4) modelId
  if (modelName) return modelName;

  if (brand && modelId) return `${brand} ${modelId}`;
  if (manufacturer && modelId) return `${manufacturer} ${modelId}`;
  return modelId;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const existing = await loadStored();
  if (existing) return existing;

  const deviceId = await generateId();

  const info: DeviceInfo = {
    deviceId,
    platform: getPlatform(),
    osVersion: safeString((Device as any).osVersion),

    deviceName: buildDeviceName(),
    model: safeString((Device as any).modelName) ?? safeString((Device as any).modelId),

    appVersion: safeString((Application as any).nativeApplicationVersion),
    buildVersion: safeString((Application as any).nativeBuildVersion),
  };

  await saveStored(info);
  return info;
}

/** kratki ID za prikaz u UI (npr. "A1B2C3") */
export function shortDeviceId(deviceId: string, length = 6): string {
  const s = (deviceId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!s) return "";
  return s.slice(0, Math.max(4, Math.min(10, length)));
}

/** Utility ako baš želiš samo ID (npr. za members/me) */
export async function getDeviceId(): Promise<string> {
  const info = await getDeviceInfo();
  return info.deviceId;
}
