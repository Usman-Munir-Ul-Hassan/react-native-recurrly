import { SubscriptionProvider } from "@/context/subscription-context";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, LogBox, View } from "react-native";
import "../../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.");
}

LogBox.ignoreLogs(["ImageBackground is deprecated"]);

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
  }, [isSignedIn, isLoaded, segments]);

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
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SubscriptionProvider>
        <InitialLayout />
      </SubscriptionProvider>
    </ClerkProvider>
  );
}
