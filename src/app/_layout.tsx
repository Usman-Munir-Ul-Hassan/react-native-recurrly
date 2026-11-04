import { SubscriptionProvider } from "@/context/subscription-context";
import { PreferencesProvider } from "@/context/preferences-context";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, LogBox, Text, View } from "react-native";
import "../../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

LogBox.ignoreLogs([
  "ImageBackground is deprecated",
  "[expo-notifications] Push notifications (remote notifications) are unavailable",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const router = useRouter();
  console.log("Clerk Auth State:", {
    isLoaded: isLoaded,
    isSignedIn: isSignedIn,
    segments: segments,
  });
  useEffect(() => {
    if (!isLoaded) return;
    // Let the pending SSO flow finish before redirecting.
    if (segments[0] === "sso-callback") {
      if (isSignedIn) router.replace("/(tabs)");
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // User is authenticated -> redirect to main app
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      // User is not authenticated -> redirect to login
      router.replace("/(auth)/login");
      Alert.alert(
        "Authentication Required",
        "Kindly register or sign in first to access your account.",
        [{ text: "OK" }]
      );
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: "#EF4444",
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Configuration Error
        </Text>
        <Text
          style={{
            color: "#9E9E9E",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please verify your environment configuration.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PreferencesProvider>
        <SubscriptionProvider>
          <InitialLayout />
        </SubscriptionProvider>
      </PreferencesProvider>
    </ClerkProvider>
  );
}
