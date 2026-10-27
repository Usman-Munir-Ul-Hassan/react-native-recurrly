import React from "react";
import { Pressable, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { SettingItem } from "@/types/settings";

interface SettingsRowProps {
  item: SettingItem;
  isLast?: boolean;
  onPress?: () => void;
}

export function SettingsRow({ item, isLast, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#F0EBE1",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: Colors.pitchBlack,
        }}
      >
        {item.label}
      </Text>

      {item.value && (
        <View
          style={{
            backgroundColor: Colors.badgeBg,
            borderWidth: 1,
            borderColor: Colors.badgeBorder,
            borderRadius: 9999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: Colors.charcoal,
            }}
          >
            {item.value}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
