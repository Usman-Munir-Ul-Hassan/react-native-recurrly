import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";

interface AppCheckboxProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

export function AppCheckbox({ checked, onChange }: AppCheckboxProps) {
  return (
    <View className="flex-row items-start mb-6">
      <Pressable
        onPress={() => onChange(!checked)}
        className="items-center justify-center mr-2.5 mt-0.5"
        style={{
          width: 18,
          height: 18,
          borderRadius: Radius.checkbox,
          borderWidth: 1,
          borderColor: checked ? Colors.midnight : Colors.fog,
          backgroundColor: checked ? Colors.midnight : Colors.cloud,
        }}
      >
        {checked && (
          <Text style={{ color: Colors.cloud, fontSize: 11, fontWeight: "bold" }}>
            ✓
          </Text>
        )}
      </Pressable>

      <Text
        className="flex-1"
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: Colors.charcoal,
          letterSpacing: -0.2,
        }}
      >
        I agree to the{" "}
        <Text style={{ textDecorationLine: "underline", color: Colors.pitchBlack }}>
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text style={{ textDecorationLine: "underline", color: Colors.pitchBlack }}>
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}
