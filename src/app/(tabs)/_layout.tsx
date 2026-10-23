import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#4f46e5",
                tabBarInactiveTintColor: "#94a3b8",
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopColor: "#f1f5f9",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                headerStyle: { backgroundColor: "#4f46e5" },
                headerTintColor: "#ffffff",
                headerTitleStyle: { fontWeight: "bold" },
            }}
        >
            {/* Tab 1: Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerTitle: "Product Catalog 🛍️",
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 20 }}>🏠</Text>
                    ),
                }}
            />

            {/* Tab 2: Subscription */}
            <Tabs.Screen
                name="subscription"
                options={{
                    title: "Premium",
                    headerTitle: "Subscription Plans 💎",
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 20 }}>💎</Text>
                    ),
                }}
            />

            {/* Tab 3: Settings */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    headerTitle: "App Settings ⚙️",
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 20 }}>⚙️</Text>
                    ),
                }}
            />

            {/* Details screen ko tab bar mein icon banne se hide karna */}
            <Tabs.Screen
                name="details"
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
