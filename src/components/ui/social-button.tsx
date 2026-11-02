import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";

const githubIcon = require("../../../assets/images/icons8-github-24.png");
const googleIcon = require("../../../assets/images/icons8-google-30.png");

interface SocialButtonProps {
  provider: "github" | "google";
  onPress: () => void;
  isLoading?: boolean;
}

export function SocialButton({ provider, onPress, isLoading }: SocialButtonProps) {
  const isGitHub = provider === "github";

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className="w-full flex-row items-center justify-center active:opacity-75 mb-3"
      style={{
        height: 46,
        backgroundColor: Colors.cloud,
        borderWidth: 1,
        borderColor: Colors.fog,
        borderRadius: Radius.button,
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.pitchBlack} style={{ marginRight: 8 }} />
      ) : (
        <View className="mr-2.5 items-center justify-center">
          <Image
            source={isGitHub ? githubIcon : googleIcon}
            style={{ width: 18, height: 18 }}
            resizeMode="contain"
          />
        </View>
      )}

      <Text
        style={{
          color: Colors.pitchBlack,
          fontSize: 14,
          fontWeight: "500",
          letterSpacing: -0.2,
        }}
      >
        {isLoading ? "Connecting..." : isGitHub ? "Continue with GitHub" : "Continue with Google SSO"}
      </Text>
    </Pressable>
  );
}
