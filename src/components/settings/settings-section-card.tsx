import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { SettingSection } from "@/types/settings";
import { SettingsRow } from "./settings-row";

interface SettingsSectionCardProps {
  section: SettingSection;
  onItemPress?: (itemId: string) => void;
}

export function SettingsSectionCard({
  section,
  onItemPress,
}: SettingsSectionCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 36,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 36,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 6,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: Colors.pitchBlack,
          marginBottom: 6,
        }}
      >
        {section.title}
      </Text>

      {section.items.map((item, index) => (
        <SettingsRow
          key={item.id}
          item={item}
          isLast={index === section.items.length - 1}
          onPress={onItemPress ? () => onItemPress(item.id) : undefined}
        />
      ))}
    </View>
  );
}
