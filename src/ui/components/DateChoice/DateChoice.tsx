import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

// Ako nemaš paket, instaliraš ga s: expo install @react-native-community/datetimepicker
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { theme } from "../../theme";

type Preset = "today" | "tomorrow" | "custom" | null;

export type DateChoiceValue = {
  preset: Preset;
  date: Date | null; // lokalni datum (bez vremena, mi ga normaliziramo na 00:00)
};

type Props = {
  label?: string;
  value: DateChoiceValue;
  onChange: (next: DateChoiceValue) => void;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateHR(d: Date) {
  // npr. 09.01.2026.
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}

function detectPreset(date: Date | null): Preset {
  if (!date) return null;
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(today, 1));
  const sd = startOfDay(date);

  if (sameDay(sd, today)) return "today";
  if (sameDay(sd, tomorrow)) return "tomorrow";
  return "custom";
}

export function DateChoice({ label = "Datum", value, onChange }: Props) {
  const preset = useMemo(() => {
    if (value?.preset) return value.preset;
    return detectPreset(value?.date ?? null);
  }, [value]);

  const selectedDate = value?.date ? startOfDay(value.date) : null;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate ?? startOfDay(new Date()));

  function setPreset(p: Preset) {
    const today = startOfDay(new Date());
    if (p === "today") onChange({ preset: "today", date: today });
    else if (p === "tomorrow") onChange({ preset: "tomorrow", date: startOfDay(addDays(today, 1)) });
    else if (p === "custom") {
      // otvori picker i inicijaliziraj ga na trenutno odabrani datum ili danas
      setTempDate(selectedDate ?? today);
      setPickerOpen(true);
      onChange({ preset: "custom", date: selectedDate ?? today });
    } else {
      onChange({ preset: null, date: null });
    }
  }

  function onPickerChange(e: DateTimePickerEvent, d?: Date) {
    // Android: "dismissed" dolazi kad se zatvori bez odabira
    if (Platform.OS === "android") {
      setPickerOpen(false);
    }
    if (!d) return;
    const sd = startOfDay(d);
    onChange({ preset: detectPreset(sd), date: sd });
    setTempDate(sd);
  }

  function closeIosPicker() {
    setPickerOpen(false);
    const sd = startOfDay(tempDate);
    onChange({ preset: detectPreset(sd), date: sd });
  }

  const Btn = ({
    text,
    active,
    onPress,
  }: {
    text: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? theme.colors.primary : "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : "#d6d6d6",
        opacity: pressed ? 0.92 : 1,
        transform: [{ translateY: pressed ? 1 : 0 }],
        // “povišena tipka”
        shadowColor: "#000",
        shadowOpacity: active ? 0.18 : 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: active ? 4 : 2,
        flex: 1,
        alignItems: "center",
      })}
    >
      <Text
        style={{
          color: active ? "#fff" : "#111",
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        {text}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
        {label}
        {selectedDate ? (
          <Text style={{ fontWeight: "600", color: "#444" }}>  ·  {formatDateHR(selectedDate)}</Text>
        ) : null}
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Btn text="Danas" active={preset === "today"} onPress={() => setPreset("today")} />
        <Btn text="Sutra" active={preset === "tomorrow"} onPress={() => setPreset("tomorrow")} />
        <Btn text="Odaberi" active={preset === "custom"} onPress={() => setPreset("custom")} />
      </View>

      {/* Picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          onPress={() => setPickerOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
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
            <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 10, color: "#111" }}>
              Odaberi datum
            </Text>

            {Platform.OS === "ios" ? (
              <>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(e, d) => {
                    if (!d) return;
                    setTempDate(startOfDay(d));
                  }}
                />

                <Pressable
                  onPress={closeIosPicker}
                  style={{
                    marginTop: 10,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Gotovo</Text>
                </Pressable>
              </>
            ) : (
              <DateTimePicker value={tempDate} mode="date" display="calendar" onChange={onPickerChange} />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
