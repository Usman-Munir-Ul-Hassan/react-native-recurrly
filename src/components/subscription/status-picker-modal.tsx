import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "@/constants/theme";

export type SubscriptionStatus = "Active" | "Paused" | "Cancelled";

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: SubscriptionStatus;
  onSelectStatus: (status: SubscriptionStatus) => void;
  onClose: () => void;
  subscriptionName?: string;
}

interface StatusOption {
  status: SubscriptionStatus;
  label: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status: "Active",
    label: "Active",
    description: "Service is active and renews on schedule",
    badgeBg: "#ECFDF5",
    badgeBorder: "#A7F3D0",
    badgeText: "#065F46",
  },
  {
    status: "Paused",
    label: "Paused",
    description: "Temporarily paused; renewal cycle is on hold",
    badgeBg: "#FFFBEB",
    badgeBorder: "#FDE68A",
    badgeText: "#92400E",
  },
  {
    status: "Cancelled",
    label: "Cancelled",
    description: "Discontinued; no upcoming renewal charges",
    badgeBg: "#FEF2F2",
    badgeBorder: "#FECACA",
    badgeText: "#991B1B",
  },
];

export function StatusPickerModal({
  visible,
  currentStatus,
  onSelectStatus,
  onClose,
  subscriptionName,
}: StatusPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          justifyContent: "flex-end",
        }}
      >
        {/* Backdrop Dismiss */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close status picker backdrop"
        />

        {/* Bottom Sheet Container */}
        <View
          style={{
            backgroundColor: Colors.cloud,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 36,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Pull Handle Pill */}
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: "#D1D5DB",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  letterSpacing: -0.3,
                }}
              >
                Subscription Status
              </Text>
              {subscriptionName ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.graphite,
                    marginTop: 2,
                  }}
                >
                  Choose status for {subscriptionName}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: Colors.limestone,
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityLabel="Close"
              testID="btn-close-status-modal"
            >
              <Ionicons name="close" size={16} color={Colors.pitchBlack} />
            </Pressable>
          </View>

          {/* Status List */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: Colors.fog,
              borderRadius: Radius.card,
              overflow: "hidden",
            }}
          >
            {STATUS_OPTIONS.map((opt, index) => {
              const isSelected = currentStatus === opt.status;
              const isLast = index === STATUS_OPTIONS.length - 1;

              return (
                <Pressable
                  key={opt.status}
                  onPress={() => {
                    onSelectStatus(opt.status);
                    onClose();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: Colors.fog,
                    backgroundColor: isSelected ? "#F3F4F6" : "transparent",
                  }}
                  testID={`status-option-${opt.status}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Set status to ${opt.label}`}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                      <View
                        style={{
                          backgroundColor: opt.badgeBg,
                          borderWidth: 1,
                          borderColor: opt.badgeBorder,
                          borderRadius: Radius.tag,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: opt.badgeText,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.graphite,
                      }}
                    >
                      {opt.description}
                    </Text>
                  </View>

                  {/* Active Selection Checkmark Indicator */}
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.pitchBlack} />
                  ) : (
                    <View style={{ width: 20 }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
