import { SubscriptionProvider } from "@/context/subscription-context";
import { Stack } from "expo-router";
import "../../global.css";

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SubscriptionProvider>
  );
}
