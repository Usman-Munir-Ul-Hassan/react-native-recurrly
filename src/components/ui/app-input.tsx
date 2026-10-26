import { useState } from "react";
import { Image, Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { Colors, Radius, Typography } from "@/constants/theme";

const eyeIcon = require("../../../assets/images/icons8-eye-50.png");
const hideIcon = require("../../../assets/images/icons8-hide-50.png");

interface AppInputProps extends TextInputProps {
  label: string;
  rightActionText?: string;
  onRightActionPress?: () => void;
  helperText?: string;
  isPassword?: boolean;
}

export function AppInput({
  label,
  rightActionText,
  onRightActionPress,
  helperText,
  isPassword = false,
  ...props
}: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full mb-4">
      {/* Top Label & Optional Right Action */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          style={[Typography.label, { color: Colors.charcoal }]}
        >
          {label}
        </Text>

        {rightActionText && onRightActionPress && (
          <Pressable onPress={onRightActionPress}>
            <Text
              style={[
                Typography.caption,
                { color: Colors.graphite, textDecorationLine: "underline" },
              ]}
            >
              {rightActionText}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Input Box with Hairline 1px border & 4px radius */}
      <View
        className="w-full flex-row items-center bg-white px-3"
        style={{
          height: 46,
          borderWidth: 1,
          borderColor: Colors.fog,
          borderRadius: Radius.input,
        }}
      >
        <TextInput
          className="flex-1 text-sm h-full"
          style={{ color: Colors.pitchBlack }}
          placeholderTextColor={Colors.ash}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="p-1 items-center justify-center"
            hitSlop={8}
          >
            <Image
              source={showPassword ? eyeIcon : hideIcon}
              style={{ width: 18, height: 18, opacity: 0.6 }}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </View>

      {/* Helper Text */}
      {helperText && (
        <Text
          className="mt-1.5"
          style={[Typography.caption, { color: Colors.graphite }]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}
