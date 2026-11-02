import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors, Typography } from "@/constants/theme";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserAvatar } from "@/components/ui/user-avatar";

/**
 * Top application header displaying real-time user profile information.
 * Follows SRP by delegating identity extraction to useUserProfile and avatar rendering to UserAvatar.
 */
export function AppHeader() {
    const router = useRouter();
    const { displayName, initials, imageUrl } = useUserProfile();

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

            <Pressable
                onPress={() => router.push("/(tabs)/settings")}
                accessibilityRole="button"
                accessibilityLabel="Go to settings"
                hitSlop={8}
            >
                <UserAvatar imageUrl={imageUrl} initials={initials} size={38} />
            </Pressable>
        </View>
    );
}
