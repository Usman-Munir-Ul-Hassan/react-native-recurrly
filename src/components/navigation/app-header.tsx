import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Typography } from "@/constants/theme";
import { useUserProfile } from "@/hooks/use-user-profile";
import { usePreferences } from "@/context/preferences-context";
import { UserAvatar } from "@/components/ui/user-avatar";

/**
 * Top application header displaying real-time user profile information
 * and an interactive notification ring indicator synced with preferences.
 */
export function AppHeader() {
    const router = useRouter();
    const { displayName, initials, imageUrl } = useUserProfile();
    const { alertsEnabled, toggleAlerts } = usePreferences();

    return (
        <View className="flex-row items-center justify-between py-3 mb-2">
            <View className="flex-1 mr-3">
                <Text
                    style={[
                        Typography.caption,
                        {
                            color: Colors.graphite,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 2,
                        },
                    ]}
                >
                    Welcome back
                </Text>
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: Colors.pitchBlack,
                        letterSpacing: -0.4,
                    }}
                >
                    {displayName}
                </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {/* Synced Notification Bell Button */}
                <Pressable
                    onPress={toggleAlerts}
                    accessibilityRole="button"
                    accessibilityLabel={
                        alertsEnabled
                            ? "Renewal alerts active. Tap to mute."
                            : "Renewal alerts muted. Tap to enable."
                    }
                    hitSlop={8}
                    style={({ pressed }) => ({
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: alertsEnabled ? Colors.surface : "#F3F4F6",
                        borderWidth: 1,
                        borderColor: alertsEnabled ? Colors.pitchBlack : "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.75 : 1,
                    })}
                >
                    <Ionicons
                        name={alertsEnabled ? "notifications" : "notifications-off-outline"}
                        size={18}
                        color={alertsEnabled ? Colors.pitchBlack : "#9CA3AF"}
                    />
                </Pressable>

                {/* User Profile Avatar */}
                <Pressable
                    onPress={() => router.push("/(tabs)/settings")}
                    accessibilityRole="button"
                    accessibilityLabel="Go to settings"
                    hitSlop={8}
                >
                    <UserAvatar imageUrl={imageUrl} initials={initials} size={38} />
                </Pressable>
            </View>
        </View>
    );
}
