import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { parseDateSafe, toIsoDateString } from "@/utils/subscription-cycle-calculator";

interface CalendarPickerModalProps {
  visible: boolean;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = "Select Date",
}: CalendarPickerModalProps) {
  const initialDate = useMemo(() => parseDateSafe(selectedDate), [selectedDate]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Days in current viewing month
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // Day of week the 1st falls on (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const todayStr = useMemo(() => toIsoDateString(new Date()), []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const dateStr = toIsoDateString(d);
    onSelectDate(dateStr);
  };

  const handlePickToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  const handlePickLastMonth = () => {
    const current = parseDateSafe(selectedDate);
    const prev = new Date(current);
    prev.setMonth(prev.getMonth() - 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
    onSelectDate(toIsoDateString(prev));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={{
            width: "100%",
            maxWidth: 340,
            backgroundColor: Colors.cloud,
            borderRadius: Radius.card,
            borderWidth: 1,
            borderColor: Colors.fog,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* Header Title */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: Colors.pitchBlack,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ fontSize: 13, color: Colors.graphite, fontWeight: "600" }}>✕</Text>
            </Pressable>
          </View>

          {/* Month / Year Navigator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: Colors.limestone,
              borderRadius: Radius.tag,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={handlePrevMonth}
              hitSlop={8}
              accessibilityLabel="Previous month"
              testID="btn-calendar-prev-month"
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.pitchBlack, paddingHorizontal: 6 }}>
                ‹
              </Text>
            </Pressable>
            <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.pitchBlack }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={handleNextMonth}
              hitSlop={8}
              accessibilityLabel="Next month"
              testID="btn-calendar-next-month"
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.pitchBlack, paddingHorizontal: 6 }}>
                ›
              </Text>
            </Pressable>
          </View>

          {/* Weekday Labels */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 6 }}>
            {WEEKDAYS.map((w, idx) => (
              <View key={`wd-${idx}`} style={{ width: 34, alignItems: "center" }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.ash }}>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" }}>
            {/* Empty offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <View key={`empty-${idx}`} style={{ width: "14.28%", height: 36 }} />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateObj = new Date(viewYear, viewMonth, day);
              const cellDateStr = toIsoDateString(dateObj);
              const isSelected = cellDateStr === selectedDate;
              const isToday = cellDateStr === todayStr;

              return (
                <Pressable
                  key={`day-${day}`}
                  onPress={() => handleSelectDay(day)}
                  style={{
                    width: "14.28%",
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  testID={`calendar-day-${day}`}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected
                        ? Colors.pitchBlack
                        : "transparent",
                      borderWidth: isToday && !isSelected ? 1 : 0,
                      borderColor: Colors.pitchBlack,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected || isToday ? "700" : "400",
                        color: isSelected
                          ? Colors.cloud
                          : Colors.pitchBlack,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Quick Presets & Done Footer */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: Colors.fog,
            }}
          >
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable
                onPress={handlePickLastMonth}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderRadius: Radius.tag,
                  backgroundColor: Colors.limestone,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                }}
                testID="btn-calendar-last-month"
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.pitchBlack }}>
                  -1 Mo
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePickToday}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderRadius: Radius.tag,
                  backgroundColor: Colors.limestone,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                }}
                testID="btn-calendar-today"
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.pitchBlack }}>
                  Today
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 16,
                borderRadius: Radius.tag,
                backgroundColor: Colors.pitchBlack,
              }}
              testID="btn-calendar-done"
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.cloud }}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
