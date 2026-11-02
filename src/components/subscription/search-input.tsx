import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "@/constants/theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = "Search subscriptions by name or category...",
}: SearchInputProps) {
  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAF9F6",
        borderWidth: 1,
        borderColor: Colors.fog,
        borderRadius: Radius.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
      }}
    >
      {/* Search Icon */}
      <Ionicons
        name="search-outline"
        size={18}
        color={Colors.graphite}
        style={{ marginRight: 8 }}
      />

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.ash}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={{
          flex: 1,
          fontSize: 14,
          color: Colors.pitchBlack,
          paddingVertical: 0,
        }}
        testID="input-search-subscriptions"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityLabel="Clear search input"
          testID="btn-clear-search"
        >
          <Ionicons name="close-circle" size={18} color={Colors.pewter} />
        </Pressable>
      )}
    </View>
  );
}
