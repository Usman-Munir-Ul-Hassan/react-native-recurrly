import { TAB_ITEMS } from "@/constants/tabs";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#111827",
                tabBarInactiveTintColor: "#8E8E93",
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                },
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.cardBorder,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 4,
                    paddingTop: 6,
                },
            }}
        >
            {TAB_ITEMS.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? tab.iconFocused : tab.iconUnfocused}
                                size={22}
                                color={String(color)}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}
