import { LogBox } from "react-native";
import { SubscriptionProvider } from "@/context/subscription-context";
import { Stack } from "expo-router";
import "../../global.css";

LogBox.ignoreLogs(["ImageBackground is deprecated"]);

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SubscriptionProvider>
  );
}
