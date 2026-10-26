import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { TabType } from "./filter-tabs";

interface FilterDropdownProps {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const OPTIONS: { key: TabType; label: string }[] = [
  { key: "All", label: "All Subscriptions" },
  { key: "Active", label: "Active Commitments" },
  { key: "Upcoming renewal", label: "Upcoming Renewals" },
];

export function FilterDropdown({ selectedTab, onSelectTab }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = OPTIONS.find((opt) => opt.key === selectedTab)?.label || "All Subscriptions";

  return (
    <>
      {/* Dropdown Trigger Button */}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.cloud,
          borderWidth: 1,
          borderColor: Colors.fog,
          borderRadius: Radius.tag,
          paddingVertical: 7,
          paddingHorizontal: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: Colors.pitchBlack,
            marginRight: 6,
          }}
        >
          {currentLabel}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.graphite }}>▼</Text>
      </Pressable>

      {/* Modal Dropdown Menu */}
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: "100%",
                  maxWidth: 320,
                  backgroundColor: Colors.cloud,
                  borderRadius: Radius.card,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                  padding: 8,
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View className="px-3 py-2 border-b border-[#E2E2E2] mb-1">
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: Colors.graphite,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Filter Subscriptions
                  </Text>
                </View>

                {OPTIONS.map((opt) => {
                  const isSelected = selectedTab === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => {
                        onSelectTab(opt.key);
                        setIsOpen(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: Radius.tag,
                        backgroundColor: isSelected ? Colors.limestone : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? "700" : "500",
                          color: Colors.pitchBlack,
                        }}
                      >
                        {opt.label}
                      </Text>

                      {isSelected && (
                        <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.pitchBlack }}>
                          ✓
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
