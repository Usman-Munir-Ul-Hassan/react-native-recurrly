import { Text, View } from "react-native";
import { Colors } from "@/constants/theme";

export function AuthDivider() {
  return (
    <View className="w-full flex-row items-center my-6">
      <View
        className="flex-1"
        style={{ height: 1, backgroundColor: Colors.fog }}
      />
      <Text
        className="px-3"
        style={{
          fontSize: 12,
          color: Colors.pewter,
          letterSpacing: -0.2,
        }}
      >
        or continue with
      </Text>
      <View
        className="flex-1"
        style={{ height: 1, backgroundColor: Colors.fog }}
      />
    </View>
  );
}
