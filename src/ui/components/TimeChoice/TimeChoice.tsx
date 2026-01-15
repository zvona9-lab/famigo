import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { theme } from "../../theme";

type Preset = "morning" | "afternoon" | "evening" | "custom" | null;

export type TimeChoiceValue = {
  preset: Preset;
  timeHHMM: string; // "HH:MM" ili ""
};

type Props = {
  label?: string;
  value: TimeChoiceValue;
  onChange: (next: TimeChoiceValue) => void;
};

function toHHMM(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function presetToHHMM(p: Preset): string {
  if (p === "morning") return "08:00";
  if (p === "afternoon") return "14:00";
  if (p === "evening") return "19:00";
  return "";
}

function detectPreset(hhmm: string): Preset {
  if (!hhmm) return null;
  if (hhmm === "08:00") return "morning";
  if (hhmm === "14:00") return "afternoon";
  if (hhmm === "19:00") return "evening";
  return "custom";
}

export function TimeChoice({ label = "Vrijeme", value, onChange }: Props) {
  const preset = useMemo(() => {
    if (value?.preset) return value.preset;
    return detectPreset(value?.timeHHMM ?? "");
  }, [value]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(() => {
    const d = new Date();
    const s = (value?.timeHHMM ?? "").trim();
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    else d.setHours(8, 0, 0, 0);
    return d;
  });

  function setPreset(p: Preset) {
    if (p === "custom") {
      const d = new Date();
      const s = (value?.timeHHMM ?? "").trim();
      const m = s.match(/^(\d{1,2}):(\d{2})$/);
      if (m) d.setHours(Number(m[1]), Number(m[2]), 0, 0);
      setTempTime(d);
      setPickerOpen(true);
      onChange({ preset: "custom", timeHHMM: value?.timeHHMM ?? "" });
      return;
    }

    const hhmm = presetToHHMM(p);
    onChange({ preset: p, timeHHMM: hhmm });
  }

  function onPickerChange(e: DateTimePickerEvent, d?: Date) {
    if (Platform.OS === "android") setPickerOpen(false);
    if (!d) return;
    const hhmm = toHHMM(d);
    onChange({ preset: detectPreset(hhmm), timeHHMM: hhmm });
    setTempTime(d);
  }

  function closeIosPicker() {
    setPickerOpen(false);
    const hhmm = toHHMM(tempTime);
    onChange({ preset: detectPreset(hhmm), timeHHMM: hhmm });
  }

  const Btn = ({ text, active, onPress }: { text: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        backgroundColor: active ? ((theme as any)?.colors?.primary ?? "#2563eb") : "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: active ? ((theme as any)?.colors?.primary ?? "#2563eb") : "#e5e7eb",
        opacity: pressed ? 0.92 : 1,
        transform: [{ translateY: pressed ? 1 : 0 }],
        shadowColor: "#000",
        shadowOpacity: active ? 0.18 : 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: active ? 4 : 2,
        flex: 1,
        alignItems: "center",
      })}
    >
      <Text style={{ color: active ? "#fff" : "#111", fontWeight: "800", fontSize: 14 }}>{text}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: "800", color: "#111" }}>
        {label}
        {!!(value?.timeHHMM ?? "").trim() ? (
          <Text style={{ fontWeight: "700", color: "#444" }}>  ·  {value.timeHHMM}</Text>
        ) : null}
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Btn text="Ujutro" active={preset === "morning"} onPress={() => setPreset("morning")} />
        <Btn text="Popodne" active={preset === "afternoon"} onPress={() => setPreset("afternoon")} />
        <Btn text="Navečer" active={preset === "evening"} onPress={() => setPreset("evening")} />
        <Btn text="Odaberi" active={preset === "custom"} onPress={() => setPreset("custom")} />
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          onPress={() => setPickerOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fff",
              padding: 14,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", marginBottom: 10, color: "#111" }}>
              Odaberi vrijeme
            </Text>

            {Platform.OS === "ios" ? (
              <>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={(e, d) => {
                    if (!d) return;
                    setTempTime(d);
                  }}
                />
                <Pressable
                  onPress={closeIosPicker}
                  style={{
                    marginTop: 10,
                    backgroundColor: (theme as any)?.colors?.primary ?? "#2563eb",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Gotovo</Text>
                </Pressable>
              </>
            ) : (
              <DateTimePicker value={tempTime} mode="time" display="clock" onChange={onPickerChange} />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
