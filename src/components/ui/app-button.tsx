import { Pressable, Text } from "react-native";
import { Colors, Radius } from "@/constants/theme";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  showArrow?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  showArrow = true,
}: AppButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center justify-center active:opacity-85"
      style={{
        height: 48,
        borderRadius: Radius.button,
        backgroundColor: isPrimary ? Colors.midnight : Colors.cloud,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: isPrimary ? "transparent" : Colors.fog,
      }}
    >
      <Text
        style={{
          color: isPrimary ? Colors.cloud : Colors.pitchBlack,
          fontSize: 15,
          fontWeight: "500",
          letterSpacing: -0.2,
        }}
      >
        {title}
        {showArrow && " →"}
      </Text>
    </Pressable>
  );
}
